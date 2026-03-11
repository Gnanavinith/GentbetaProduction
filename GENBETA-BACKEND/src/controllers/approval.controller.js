import ApprovalLink from "../models/ApprovalLink.model.js";
import ApprovalTask from "../models/ApprovalTask.model.js";
import ApprovalGroup from "../models/ApprovalGroup.model.js";
import Form from "../models/Form.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import FormTask from "../models/FormTask.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import {
  sendApprovalEmail,
  sendSubmissionNotificationToApprover,
  sendFinalApprovalNotificationToSubmitter,
  sendApprovalStatusNotificationToPlant,
  sendRejectionNotificationToSubmitter,
  sendFinalApprovalNotificationToPlant
} from "../services/email/index.js";
import crypto from "crypto";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache } from "../utils/cache.js";
import mongoose from "mongoose";
import { createNotification } from "../utils/notify.js";

/* ======================================================
   SHARED HELPERS
====================================================== */

/**
 * Batch-fetch approver names for an approvalHistory array.
 * Replaces N sequential User.findById calls with a single $in query.
 * @param {Array} approvalHistory
 * @returns {Array} [{ name, date, comments }]
 */
async function buildHistoryWithNames(approvalHistory) {
  if (!approvalHistory?.length) return [];
  const ids = [...new Set(approvalHistory.map(h => h.approverId?.toString()).filter(Boolean))];
  const users = await User.find({ _id: { $in: ids } }).select("name").lean();
  const nameMap = new Map(users.map(u => [u._id.toString(), u.name]));
  return approvalHistory.map(h => ({
    name: nameMap.get(h.approverId?.toString()) || "Approver",
    date: h.actionedAt,
    comments: h.comments
  }));
}

/**
 * Invalidate all cache keys related to a submission's users.
 */
async function invalidateApprovalCache(submission) {
  try {
    const keys = [
      generateCacheKey("employee-assigned-submissions", {
        userId: submission.submittedBy?.toString(),
        plantId: submission.plantId?.toString()
      }),
      generateCacheKey("employee-stats", { userId: submission.submittedBy?.toString() })
    ];
    await Promise.allSettled(keys.map(k => deleteFromCache(k)));
  } catch (_) { /* non-critical */ }
}

/* ======================================================
   APPROVAL TASK (INTERNAL WORKFLOW)
====================================================== */

export const createApprovalTask = async (req, res) => {
  try {
    const { formIds, approverId, dueDate } = req.body;
    const { userId, plantId, companyId } = req.user;

    if (!formIds || formIds.length === 0) {
      return res.status(400).json({ message: "At least one form is required" });
    }

    const task = await ApprovalTask.create({
      approverId, formIds, plantId, companyId,
      submittedBy: userId, dueDate, status: "PENDING"
    });

    // Update form statuses to IN_APPROVAL
    await Form.updateMany(
      { _id: { $in: formIds } },
      { $set: { status: "IN_APPROVAL", approvalTaskId: task._id } }
    );

    // Non-blocking notification
    setImmediate(async () => {
      try {
        const [approver, forms, company, plant] = await Promise.all([
          User.findById(approverId).select("name email").lean(),
          Form.find({ _id: { $in: formIds } }).select("formName").lean(),
          Company.findById(companyId).lean(),
          Plant.findById(plantId).lean()
        ]);
        if (approver?.email) {
          const formNames = forms.map(f => f.formName).join(", ");
          await sendApprovalEmail(approver.email, formNames, null,
            `${process.env.FRONTEND_URL}/employee/tasks`, company, plant);
        }
      } catch (e) { console.error("Failed to notify approver of new task:", e); }
    });

    res.status(201).json({ success: true, message: "Approval task created successfully", task });
  } catch (error) {
    console.error("Create approval task error:", error);
    res.status(500).json({ message: "Failed to create approval task" });
  }
};

export const getApprovalTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    const query = { approverId: userId };
    if (status) query.status = status;

    const tasks = await ApprovalTask.find(query)
      .populate("formIds", "formName description")
      .populate("submittedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    console.error("Get approval tasks error:", error);
    res.status(500).json({ message: "Failed to fetch approval tasks" });
  }
};

export const getApprovalTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await ApprovalTask.findById(id)
      .populate("formIds")
      .populate("submittedBy", "name")
      .populate("completedForms")
      .lean();

    if (!task) return res.status(404).json({ message: "Approval task not found" });
    res.json(task);
  } catch (error) {
    console.error("Get approval task details error:", error);
    res.status(500).json({ message: "Failed to fetch task details" });
  }
};

export const sendLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { approverEmail } = req.body;

    const form = await Form.findById(id).lean();
    if (!form) return res.status(404).json({ message: "Form not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await ApprovalLink.create({ formIds: [form._id], plantId: form.plantId, token, approverEmail, expiresAt });

    const [company, plant] = await Promise.all([
      Company.findById(form.companyId).lean(),
      Plant.findById(form.plantId).lean()
    ]);

    const approvalLink = `${process.env.FRONTEND_URL}/approve/${token}`;
    await sendApprovalEmail(approverEmail, form.formName, form.formId, approvalLink, company, plant);

    res.json({ message: "Approval link sent successfully" });
  } catch (error) {
    console.error("Send link error:", error);
    res.status(500).json({ message: "Failed to send link" });
  }
};

export const sendMultiFormLink = async (req, res) => {
  try {
    const { formIds, approverEmail } = req.body;
    if (!formIds || formIds.length === 0) {
      return res.status(400).json({ message: "At least one form is required" });
    }

    const forms = await Form.find({ _id: { $in: formIds } }).lean();
    if (forms.length !== formIds.length) {
      return res.status(404).json({ message: "One or more forms not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await ApprovalLink.create({ formIds, plantId: forms[0].plantId, token, approverEmail, expiresAt });

    const [company, plant] = await Promise.all([
      Company.findById(forms[0].companyId).lean(),
      Plant.findById(forms[0].plantId).lean()
    ]);

    const approvalLink = `${process.env.FRONTEND_URL}/approve/${token}`;
    await sendApprovalEmail(approverEmail, `${forms.length} Forms: ${forms.map(f => f.formName).join(", ")}`,
      null, approvalLink, company, plant);

    res.json({ message: "Approval link sent successfully for multiple forms" });
  } catch (error) {
    console.error("Send multi-form link error:", error);
    res.status(500).json({ message: "Failed to send link" });
  }
};

export const getFormByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await ApprovalLink.findOne({ token, isUsed: false }).lean();
    if (!link) return res.status(404).json({ message: "Invalid or used link" });
    if (new Date() > link.expiresAt) return res.status(410).json({ message: "Link has expired" });

    const forms = await Form.find({ _id: { $in: link.formIds } }).select("-companyId -createdBy").lean();
    if (forms.length === 0) return res.status(404).json({ message: "Forms no longer exist" });

    res.json({ forms, completedForms: link.completedForms || [], approverEmail: link.approverEmail, isMultiForm: forms.length > 1 });
  } catch (error) {
    console.error("Get form by token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitFormByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { formId, data } = req.body;

    const link = await ApprovalLink.findOne({ token, isUsed: false });
    if (!link) return res.status(404).json({ message: "Invalid or used link" });
    if (new Date() > link.expiresAt) return res.status(410).json({ message: "Link has expired" });
    if (!link.formIds.map(id => id.toString()).includes(formId)) {
      return res.status(400).json({ message: "Form not part of this approval link" });
    }
    if (link.completedForms?.map(id => id.toString()).includes(formId)) {
      return res.status(400).json({ message: "This form has already been submitted" });
    }

    const form = await Form.findById(formId).lean();
    if (!form) return res.status(404).json({ message: "Form not found" });

    await FormSubmission.create({
      templateId: form._id, templateModel: "Form", templateName: form.formName,
      plantId: form.plantId, companyId: form.companyId, submittedBy: link.approverEmail, data, status: "SUBMITTED"
    });

    link.completedForms = link.completedForms || [];
    link.completedForms.push(formId);
    if (link.completedForms.length === link.formIds.length) link.isUsed = true;
    await link.save();

    res.json({
      message: "Form submitted successfully",
      allFormsCompleted: link.completedForms.length === link.formIds.length,
      completedCount: link.completedForms.length,
      totalForms: link.formIds.length
    });
  } catch (error) {
    console.error("Submit form by token error:", error);
    res.status(500).json({ message: "Failed to submit form" });
  }
};

/* ======================================================
   EMPLOYEE APPROVAL WORKFLOW
====================================================== */

export const getAssignedSubmissions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { plantId } = req.user;

    const cacheKey = generateCacheKey("employee-assigned-submissions", { userId, plantId });

    try {
      const cached = await getFromCache(cacheKey);
      if (cached) return res.json(cached);
    } catch (_) { /* continue without cache */ }

    // ── Batch: user groups + forms in parallel ──────────────────────────────
    const userGroups = await ApprovalGroup.find({ members: userId, isActive: true })
      .select("_id").lean();
    const userGroupIds = userGroups.map(g => g._id.toString());

    const [directApproverForms, groupApproverForms, formsWithoutFlow] = await Promise.all([
      Form.find({ plantId, "approvalFlow": { $elemMatch: { type: "USER", approverId: userId } } })
        .select("_id approvalFlow").lean(),
      Form.find({ plantId, "approvalFlow": { $elemMatch: { type: "GROUP", groupId: { $in: userGroupIds.map(id => new mongoose.Types.ObjectId(id)) } } } })
        .select("_id approvalFlow").lean(),
      Form.find({ plantId, $or: [{ approvalFlow: { $exists: false } }, { approvalFlow: { $size: 0 } }] })
        .select("_id").lean()
    ]);

    const allRelevantFormIds = [
      ...directApproverForms.map(f => f._id.toString()),
      ...groupApproverForms.map(f => f._id.toString()),
      ...formsWithoutFlow.map(f => f._id.toString())
    ];

    if (allRelevantFormIds.length === 0) {
      await setInCache(cacheKey, [], 120).catch(() => {});
      return res.json([]);
    }

    const submissions = await FormSubmission.find({
      formId: { $in: allRelevantFormIds },
      status: { $in: ["PENDING_APPROVAL", "SUBMITTED"] }
    })
      .populate("formId", "formName approvalFlow")
      .populate("submittedBy", "name email")
      .sort({ submittedAt: -1 })
      .lean();

    const validSubmissions = submissions.filter(sub => sub.formId?._id);

    const enhancedSubmissions = validSubmissions.map(sub => {
      const flow = sub.formId?.approvalFlow || [];

      if (flow.length === 0) {
        return { ...sub, isMyTurn: true, userLevel: 1, pendingApproverName: null };
      }

      const userLevelEntry = flow.find(f => {
        if (f.type === "USER" || !f.type) {
          return f.approverId?._id?.toString() === userId.toString() ||
            f.approverId?.toString() === userId.toString();
        }
        if (f.type === "GROUP") return userGroupIds.includes(f.groupId?.toString());
        return false;
      });

      const userLevel = userLevelEntry?.level;
      const isMyTurn = sub.currentLevel === userLevel;

      let pendingApproverName = null;
      if (!isMyTurn && userLevel && sub.currentLevel < userLevel) {
        const currentLevelEntry = flow.find(f => f.level === sub.currentLevel);
        pendingApproverName = currentLevelEntry?.type === "GROUP"
          ? currentLevelEntry.name || "Previous Group Approver"
          : currentLevelEntry?.approverId?.name || "Previous Approver";
      }

      return { ...sub, isMyTurn, userLevel, pendingApproverName };
    });

    try { await setInCache(cacheKey, enhancedSubmissions, 120); } catch (_) {}

    res.json(enhancedSubmissions);
  } catch (error) {
    console.error("Get assigned submissions error:", error);
    res.status(500).json({ message: "Failed to fetch assigned submissions" });
  }
};

// Approve or Reject a submission
export const processApproval = async (req, res) => {
  try {
    const { submissionId, status, comments, data } = req.body;
    const userId = req.user.userId;

    if (!submissionId) {
      return res.status(400).json({ message: "Submission ID is required" });
    }

    const submission = await FormSubmission.findById(submissionId).populate({
      path: "formId",
      populate: [
        { path: "approvalFlow.approverId", select: "name email" },
        { path: "approvalFlow.groupId", select: "groupName name members" }
      ]
    });

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const form = submission.formId;
    const flow = form?.approvalFlow || [];

    // ── Authorization ────────────────────────────────────────────────────────
    if (flow.length > 0) {
      const currentApprover = flow.find(f => f.level === submission.currentLevel);
      if (!currentApprover) return res.status(403).json({ message: "No approver found for this level" });

      const approverType = currentApprover.type || "USER";

      if (approverType === "GROUP") {
        const group = await ApprovalGroup.findOne({ _id: currentApprover.groupId, isActive: true })
          .select("members").lean();
        if (!group) return res.status(404).json({ message: "Approval group not found" });

        const isMember = group.members.some(m => m.toString() === userId.toString());
        if (!isMember) return res.status(403).json({ message: "You are not a member of this approval group" });

        const existingApproval = submission.approvalHistory.find(
          h => h.level === submission.currentLevel && h.status === "APPROVED" && h.isGroupApproval
        );
        if (existingApproval) {
          return res.status(400).json({ message: `Already approved by another group member at level ${submission.currentLevel}` });
        }
      } else {
        const approverId = currentApprover.approverId?._id?.toString() || currentApprover.approverId?.toString();
        if (approverId !== userId.toString()) {
          return res.status(403).json({ message: "You are not the authorized approver for this level" });
        }
      }
    }

    // ── Apply data edits ──────────────────────────────────────────────────────
    if (data) {
      submission.data = { ...submission.data, ...data };
      submission.markModified("data");
    }

    const currentApproverConfig = flow.find(f => f.level === submission.currentLevel);
    if (flow.length > 0 && !currentApproverConfig) {
      return res.status(400).json({ message: `No approver configured for level ${submission.currentLevel}` });
    }

    const isGroupApproval = currentApproverConfig?.type === "GROUP";

    // Push history entry
    submission.approvalHistory.push({
      level: submission.currentLevel,
      approverId: userId,
      status: status.toUpperCase(),
      comments,
      actionedAt: new Date(),
      type: isGroupApproval ? "GROUP" : "USER",
      groupId: isGroupApproval ? currentApproverConfig?.groupId : null,
      groupName: isGroupApproval ? (currentApproverConfig?.name || "Approval Group") : null,
      isGroupApproval
    });

    // ── REJECTED ──────────────────────────────────────────────────────────────
    if (status.toLowerCase() === "rejected") {
      submission.status = "REJECTED";
      submission.rejectedAt = new Date();
      submission.rejectedBy = userId;

      setImmediate(async () => {
        try {
          const [submitter, rejector, company, plant] = await Promise.all([
            User.findById(submission.submittedBy).select("name email").lean(),
            User.findById(userId).select("name").lean(),
            Company.findById(submission.companyId).lean(),
            Plant.findById(submission.plantId).lean()
          ]);
          if (submitter?.email && comments) {
            const viewLink = `${process.env.FRONTEND_URL}/employee/submissions/${submission._id}`;
            const plantIdStr = plant?.plantNumber || plant?._id?.toString() || "";
            const formIdStr = (form?.numericalId || submission.formNumericalId)?.toString() || form?.formId || form?._id?.toString() || "";
            const submissionIdStr = submission.numericalId?.toString() || submission._id?.toString() || "";
            await sendRejectionNotificationToSubmitter(
              submitter.email, form.formName || form.templateName,
              rejector?.name || "An approver", comments, viewLink,
              company, plant, plantIdStr, formIdStr, submissionIdStr
            );
          }
          if (submitter) {
            await createNotification({
              userId: submitter._id,
              title: "Form Rejected",
              message: `Your form "${form.formName || form.templateName}" has been rejected`,
              link: `/employee/submissions/${submission._id}`
            }).catch(() => {});
          }
        } catch (e) { console.error("Failed to send rejection notification:", e); }
      });

    // ── APPROVED ──────────────────────────────────────────────────────────────
    } else {
      const nextLevel = submission.currentLevel + 1;
      const nextLevelEntry = flow.find(f => f.level === nextLevel);

      if (nextLevelEntry) {
        // More levels remain
        submission.currentLevel = nextLevel;
        submission.status = "PENDING_APPROVAL";

        setImmediate(async () => {
          try {
            const [submitter, currentApproverUser, company, plant] = await Promise.all([
              User.findById(submission.submittedBy).select("name email").lean(),
              User.findById(userId).select("name email").lean(),
              Company.findById(submission.companyId).lean(),
              Plant.findById(submission.plantId).lean()
            ]);

            const plantIdStr = plant?.plantNumber || plant?._id?.toString() || "";
            const formIdStr = (form?.numericalId || submission.formNumericalId)?.toString() || form?.formId || form?._id?.toString() || "";
            const submissionIdStr = submission.numericalId?.toString() || submission._id?.toString() || "";
            const approvalLink = `${process.env.FRONTEND_URL}/employee/approvals/${submission._id}`;

            // ── FIX: batch-fetch previous approver names ──────────────────────
            const approverIds = [...new Set(
              submission.approvalHistory.map(h => h.approverId?.toString()).filter(Boolean)
            )];
            const approverUsers = await User.find({ _id: { $in: approverIds } }).select("name").lean();
            const approverNameMap = new Map(approverUsers.map(u => [u._id.toString(), u.name]));
            const previousApprovals = submission.approvalHistory.map(h => ({
              name: approverNameMap.get(h.approverId?.toString()) || "Unknown Approver",
              date: h.actionedAt,
              status: h.status || "APPROVED",
              comments: h.comments || ""
            }));
            if (previousApprovals.length === 0) {
              previousApprovals.push({ name: currentApproverUser?.name || "Previous Approver", date: new Date(), status: "APPROVED", comments: "" });
            }

            if (nextLevelEntry.type === "GROUP") {
              const group = await ApprovalGroup.findById(nextLevelEntry.groupId)
                .populate("members", "name email").lean();

              if (group?.members?.length > 0) {
                // Parallel: notifications + emails for all group members
                await Promise.allSettled([
                  // In-app notifications (batch)
                  ...group.members.map(member =>
                    createNotification({
                      userId: member._id,
                      title: "Approval Required",
                      message: `Form ${form.formName} waiting for your approval (Group: ${group.groupName})`,
                      link: `/employee/approvals/${submission._id}`
                    }).catch(() => {})
                  ),
                  // Emails
                  ...group.members.filter(m => m.email).map(member =>
                    sendSubmissionNotificationToApprover(
                      member.email, form.formName || form.templateName,
                      submitter?.name || "An employee", submission.createdAt,
                      approvalLink, previousApprovals, company, plant,
                      plantIdStr, formIdStr, submissionIdStr,
                      form?.fields || [], submission.data || {},
                      "PLANT_ADMIN", submission.companyId?.toString() || null,
                      submitter?.email || null
                    ).catch(e => console.error(`Email failed for ${member.email}:`, e))
                  )
                ]);

                // Notify submitter
                if (submitter) {
                  createNotification({
                    userId: submitter._id,
                    title: "Form In Progress",
                    message: `Your form "${form.formName}" has been approved and moved to ${group.groupName} for approval`,
                    link: `/employee/submissions/${submission._id}`
                  }).catch(() => {});
                }
              }
            } else {
              // Individual approver
              const nextApproverId = nextLevelEntry.approverId?._id || nextLevelEntry.approverId;
              const nextApprover = await User.findById(nextApproverId).select("name email").lean();

              if (nextApprover?.email) {
                await sendSubmissionNotificationToApprover(
                  nextApprover.email, form.formName || form.templateName,
                  submitter?.name || "An employee", submission.createdAt,
                  approvalLink, previousApprovals, company, plant,
                  plantIdStr, formIdStr, submissionIdStr,
                  form?.fields || [], submission.data || {},
                  "PLANT_ADMIN", submission.companyId?.toString() || null,
                  submitter?.email || null
                ).catch(e => console.error("Email failed for next approver:", e));

                createNotification({
                  userId: nextApprover._id,
                  title: "Approval Required",
                  message: `Form ${form.formName} waiting for your approval`,
                  link: `/employee/approvals/${submission._id}`
                }).catch(() => {});
              }

              if (submitter) {
                createNotification({
                  userId: submitter._id,
                  title: "Form In Progress",
                  message: `Your form "${form.formName}" has been approved by ${currentApproverUser?.name || "an approver"} and moved to the next approval level`,
                  link: `/employee/submissions/${submission._id}`
                }).catch(() => {});
              }
            }

            // Notify plant admin of progress
            const plantAdmin = await User.findOne({ plantId: submission.plantId, role: "PLANT_ADMIN" })
              .select("_id email").lean();
            if (plantAdmin) {
              createNotification({
                userId: plantAdmin._id,
                title: "Form In Progress",
                message: `Form "${form.formName}" approved by ${currentApproverUser?.name || "an approver"} and moved to next level`,
                link: `/plant/submissions/${submission._id}`
              }).catch(() => {});
            }
          } catch (e) { console.error("Failed to notify next approver:", e); }
        });

      } else {
        // Final approval
        submission.status = "APPROVED";
        submission.approvedAt = new Date();
        submission.approvedBy = userId;
        submission.currentLevel = flow.length + 1;

        setImmediate(async () => {
          try {
            const [submitter, company, plant, plantAdmin] = await Promise.all([
              User.findById(submission.submittedBy).select("name email").lean(),
              Company.findById(submission.companyId).lean(),
              Plant.findById(submission.plantId).lean(),
              User.findOne({ plantId: submission.plantId, role: "PLANT_ADMIN", isActive: true })
                .select("_id email").lean()
            ]);

            const plantIdStr = plant?.plantNumber || plant?._id?.toString() || "";
            const formIdStr = (form?.numericalId || submission.formNumericalId)?.toString() || form?.formId || form?._id?.toString() || "";
            const submissionIdStr = submission.numericalId?.toString() || submission._id?.toString() || "";
            const approverUser = await User.findById(userId).select("name email").lean();

            // ── FIX: single batch query instead of N User.findById calls ───────
            const historyWithNames = await buildHistoryWithNames(submission.approvalHistory);

            await Promise.allSettled([
              // Email submitter
              submitter?.email ? sendFinalApprovalNotificationToSubmitter(
                submitter.email, form.formName || form.templateName,
                submission.createdAt, historyWithNames, company, plant,
                plantIdStr, formIdStr, submissionIdStr,
                "PLANT_ADMIN", submission.companyId, submission.plantId
              ) : Promise.resolve(),

              // Email plant admin
              plantAdmin?.email ? sendFinalApprovalNotificationToPlant(
                plantAdmin.email, form.formName || form.templateName,
                submission.createdAt, historyWithNames, company, plant,
                plantIdStr, formIdStr, submissionIdStr,
                "PLANT_ADMIN", submission.companyId, submission.plantId,
                approverUser?.email || null, approverUser?.name || "An approver"
              ) : Promise.resolve(),

              // In-app: plant admin
              plantAdmin ? createNotification({
                userId: plantAdmin._id,
                title: "Form Approved",
                message: `Form "${form.formName}" has been fully approved`,
                link: `/plant/submissions/${submission._id}`
              }) : Promise.resolve(),

              // In-app: submitter
              submitter ? createNotification({
                userId: submitter._id,
                title: "Form Approved",
                message: `Your form "${form.formName}" has been fully approved`,
                link: `/employee/submissions/${submission._id}`
              }) : Promise.resolve()
            ]);
          } catch (e) { console.error("Failed to notify final approval:", e); }
        });
      }
    }

    await submission.save();

    // Invalidate relevant caches
    invalidateApprovalCache(submission);

    // Non-blocking: plant admin status email for intermediate approvals
    setImmediate(async () => {
      try {
        const isIntermediate = submission.status === "PENDING_APPROVAL";
        if (!isIntermediate) return; // Final approval handled above

        const [plant, company, submitter, approverUser, plantAdmin] = await Promise.all([
          Plant.findById(submission.plantId).lean(),
          Company.findById(submission.companyId).lean(),
          User.findById(submission.submittedBy).select("name").lean(),
          User.findById(userId).select("name email").lean(),
          User.findOne({ plantId: submission.plantId, role: "PLANT_ADMIN", isActive: true })
            .select("email").lean()
        ]);

        if (!plantAdmin?.email) return;

        const plantIdStr = plant?.plantNumber || plant?._id?.toString() || "";
        const formIdStr = (form?.numericalId || submission.formNumericalId)?.toString() || form?.formId || form?._id?.toString() || "";
        const submissionIdStr = submission.numericalId?.toString() || submission._id?.toString() || "";
        const viewLink = `${process.env.FRONTEND_URL}/plant/submissions/${submission._id}`;

        await sendApprovalStatusNotificationToPlant(
          plantAdmin.email, form.formName || form.templateName,
          submitter?.name || "An employee", approverUser?.name || "An approver",
          status, comments || "", viewLink, company, plant,
          plantIdStr, formIdStr, submissionIdStr,
          submission.currentLevel || 1, "PLANT_ADMIN", submission.companyId,
          null, approverUser?.email || null
        );
      } catch (e) { console.error("Failed to send plant admin status email:", e); }
    });

    res.json({ message: `Submission ${status} successfully`, submission });
  } catch (error) {
    console.error("Process approval error:", error);
    res.status(500).json({ message: "Failed to process approval" });
  }
};

// Get stats for employee dashboard
export const getEmployeeStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = generateCacheKey("employee-stats", { userId });

    try {
      const cached = await getFromCache(cacheKey);
      if (cached) return res.json(cached);
    } catch (_) {}

    const [pendingAgg, actionedCount] = await Promise.all([
      FormSubmission.aggregate([
        {
          $lookup: {
            from: "forms", localField: "templateId", foreignField: "_id", as: "form"
          }
        },
        { $unwind: "$form" },
        {
          $match: {
            "form.approvalFlow.approverId": new mongoose.Types.ObjectId(userId),
            status: { $in: ["PENDING_APPROVAL", "IN_PROGRESS", "in_progress", "SUBMITTED"] },
            $expr: {
              $and: [
                { $eq: ["$currentLevel", {
                  $arrayElemAt: [
                    "$form.approvalFlow.level",
                    { $indexOfArray: ["$form.approvalFlow.approverId", new mongoose.Types.ObjectId(userId)] }
                  ]
                }] },
                { $ne: ["$currentLevel", null] }
              ]
            }
          }
        },
        { $count: "pendingCount" }
      ]),
      FormSubmission.countDocuments({ "approvalHistory.approverId": userId })
    ]);

    const result = {
      pendingCount: pendingAgg[0]?.pendingCount || 0,
      actionedCount
    };

    await setInCache(cacheKey, result, 120).catch(() => {});
    res.json(result);
  } catch (error) {
    console.error("Get employee stats error:", error);
    res.status(500).json({ message: "Failed to fetch employee stats" });
  }
};