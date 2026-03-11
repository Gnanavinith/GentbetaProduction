import Form from "../models/Form.model.js";
import FormTemplate from "../models/FormTemplate.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import mongoose from "mongoose";
import { 
  sendFormCreatedApproverNotification,
  sendGroupApproverFormNotification
} from "../services/email/index.js";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache } from "../utils/cache.js";
import { generateFormId } from "../utils/formIdGenerator.js";
import { checkFormCreationLimit } from "../utils/subscriptionValidator.js";
import { createNotification } from "../utils/notify.js";
import { getPlanById } from "../config/plans.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validate that grid-table fields have correct structure.
 */
function validateLayoutStructure(fields) {
  if (!Array.isArray(fields)) return;
  for (const field of fields) {
    if (field.type === "grid-table") {
      if (field.columns && !Array.isArray(field.columns)) {
        throw new Error("Grid-table fields must have 'columns' as an array");
      }
      if (field.items && !Array.isArray(field.items)) {
        throw new Error("Grid-table fields must have 'items' as an array");
      }
    }
  }
}

/**
 * Invalidate all known cache permutations for a given role + plant.
 * Covers pages 1–5 and common limit values.
 */
async function invalidateFormCache(role, plantId) {
  const pages = [1, 2, 3, 4, 5];
  const limits = [10, 20, 50, 100];
  const invalidations = [];

  for (const page of pages) {
    for (const limit of limits) {
      const key = generateCacheKey("forms", { page, limit, role, plantId });
      invalidations.push(deleteFromCache(key));
    }
    // Also invalidate the "unlimited" variant (limit = 0)
    invalidations.push(deleteFromCache(generateCacheKey("forms", { page, limit: 0, role, plantId })));
  }

  try {
    await Promise.all(invalidations);
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}

/**
 * Map incoming approvalLevels or approvalFlow array to the standard backend shape.
 */
function mapApprovalFlow(levels = []) {
  return levels.map((level, index) => ({
    level: index + 1,
    type: level.type || "USER", // Default to USER for backward compatibility
    approverId: level.approverId,
    groupId: level.groupId,
    approvalMode: level.approvalMode || "ANY_ONE",
    name: level.name || `Level ${index + 1}`,
    description: level.description || "",
  }));
}

/**
 * Send in-app notifications to all active employees in a plant.
 */
async function notifyEmployees(plantId, title, message) {
  try {
    const employees = await User.find({ plantId, role: "EMPLOYEE", isActive: true }, "_id");
    await Promise.all(
      employees.map((emp) =>
        createNotification({ userId: emp._id, title, message, link: "/employee/forms-view" })
      )
    );
  } catch (err) {
    console.error("Employee notification error:", err);
  }
}

/**
 * Send email notifications to all approvers in an approval flow (non-blocking).
 */
async function notifyApprovers({ approvalFlow, formId, formName, actorId, companyId, plantId }) {
  (async () => {
    try {
      const [actor, company, plant] = await Promise.all([
        User.findById(actorId, "name"),
        Company.findById(companyId),
        Plant.findById(plantId),
      ]);

      const reviewLink = `${process.env.FRONTEND_URL}/employee/approval/pending`;

      for (const level of approvalFlow) {
        if (level.type === "GROUP" && level.groupId) {
          // Notify all group members
          try {
            const ApprovalGroup = mongoose.model("ApprovalGroup");
            const group = await ApprovalGroup.findById(level.groupId)
              .populate("members", "name email")
              .lean();

            if (group && group.members?.length > 0) {
              for (const member of group.members) {
                if (!member.email) continue;
                try {
                  await sendGroupApproverFormNotification(
                    member.email,
                    member.name,
                    formName,
                    formId,
                    group.groupName,
                    actor?.name || "A plant admin",
                    reviewLink,
                    company,
                    plant
                  );
                  console.log(`Group approver email sent to ${member.email} (${member.name}) for group ${group.groupName}`);
                } catch (emailErr) {
                  console.error(`Failed to send email to group member ${member.email}:`, emailErr);
                }
              }
            }
          } catch (groupErr) {
            console.error("Error notifying group approvers:", groupErr);
          }
        } else if (level.approverId) {
          // Individual approver notification (existing logic)
          const approver = await User.findById(level.approverId, "name email");
          if (!approver?.email) continue;
          try {
            await sendFormCreatedApproverNotification(
              approver.email,
              formName,
              formId,
              actor?.name || "A plant admin",
              reviewLink,
              company,
              plant
            );
          } catch (emailErr) {
            console.error(`Failed to send email to approver ${approver.email}:`, emailErr);
          }
        }
      }
    } catch (err) {
      console.error("Approver notification error:", err);
    }
  })();
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/* ======================================================
   CREATE FORM
====================================================== */
export const createForm = async (req, res) => {
  try {
    const {
      formId: providedFormId,
      formName,
      fields,
      sections,
      approvalFlow,
      approvalLevels,
      description,
      status,
    } = req.body;

    // Validate layout
    const fieldsToValidate =
      sections?.length > 0 ? sections.flatMap((s) => s.fields || []) : fields || [];
    validateLayoutStructure(fieldsToValidate);

    // Check subscription limit
    const limitCheck = await checkFormCreationLimit(req.user.plantId, req.user.companyId);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: limitCheck.message,
        overLimit: true,
        upgradeRequired: limitCheck.upgradeRequired,
        currentCount: limitCheck.currentCount,
        limit: limitCheck.limit,
      });
    }

    // Resolve a unique formId
    let finalFormId = providedFormId || generateFormId(formName);
    if (!providedFormId) {
      const MAX_ATTEMPTS = 5;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const existing = await Form.findOne({ formId: finalFormId }, "_id").lean();
        if (!existing) break;
        finalFormId = generateFormId(formName + Date.now().toString());
      }
    }

    const finalApprovalFlow = mapApprovalFlow(approvalLevels || approvalFlow);

    const form = await Form.create({
      formId: finalFormId,
      formName,
      description,
      fields: fields || [],
      sections: sections || [],
      approvalFlow: finalApprovalFlow,
      companyId: req.user.companyId,
      plantId: req.user.plantId,
      createdBy: req.user.userId,
      status: status || "DRAFT",
      isTemplate: req.body.isTemplate || false,
    });

    console.log(`Form created — status: ${form.status}, id: ${form._id}`);

    // Invalidate cache (non-blocking)
    invalidateFormCache(req.user.role, req.user.plantId);

    res.status(201).json({ success: true, message: "Form created successfully", form });

    // Post-response side effects (non-blocking)
    const isPublished = form.status === "PUBLISHED" || form.status === "APPROVED";
    if (isPublished) {
      notifyEmployees(form.plantId, "New Form Available", `${form.formName} is now available`);
    }

    if (finalApprovalFlow.length > 0) {
      notifyApprovers({
        approvalFlow: finalApprovalFlow,
        formId: form._id,
        formName: form.formName,
        actorId: req.user.userId,
        companyId: req.user.companyId,
        plantId: req.user.plantId,
      });
    }
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create form" });
  }
};

/* ======================================================
   GET FORMS (LIST)
====================================================== */
export const getForms = async (req, res) => {
  try {
    const { role, plantId } = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);

    // Build filter
    const filter = { isActive: true };
    if (role === "PLANT_ADMIN" || role === "EMPLOYEE") {
      filter.plantId = plantId;
    }
    if (role === "EMPLOYEE") {
      filter.status = { $in: ["APPROVED", "PUBLISHED"] };
    }

    // Resolve pagination limit based on subscription plan
    let limit = parseInt(req.query.limit) || 10;
    let unlimited = false;

    if (role === "PLANT_ADMIN") {
      const plant = await Plant.findById(plantId, "companyId").lean();
      if (plant) {
        const company = await Company.findById(plant.companyId, "subscription").lean();
        const planId = company?.subscription?.plan || "SILVER";
        const plan = getPlanById(planId);
        const maxForms = plan?.limits?.maxFormsPerPlant;

        if (maxForms === -1 || maxForms === 0) {
          unlimited = true;
        } else if (maxForms > 0) {
          // Use plan limit unless query limit is provided AND within plan limit
          const queryLimit = parseInt(req.query.limit);
          if (queryLimit && queryLimit <= maxForms) {
            limit = queryLimit;
          } else {
            limit = maxForms;
          }
        }
      }
    }

    const skip = unlimited ? 0 : (page - 1) * limit;

    // Cache lookup
    const cacheParams = { page, limit: unlimited ? 0 : limit, role };
    if (filter.plantId) cacheParams.plantId = filter.plantId;
    if (filter.status) cacheParams.status = JSON.stringify(filter.status);
    const cacheKey = generateCacheKey("forms", cacheParams);

    const cached = await getFromCache(cacheKey);
    if (cached) return res.json(cached);

    // DB query
    const [total, forms] = await Promise.all([
      Form.countDocuments(filter),
      (() => {
        let q = Form.find(filter).sort({ createdAt: -1 });
        if (!unlimited) q = q.skip(skip).limit(limit);
        return q.lean();
      })(),
    ]);

    // Attach submission counts in parallel
    const data = await Promise.all(
      forms.map(async (form) => {
        const submissionCount = await FormSubmission.countDocuments({ formId: form._id });
        return { ...form, id: form._id, submissionCount };
      })
    );

    const totalPages = unlimited ? 1 : Math.ceil(total / limit);
    const result = {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    await setInCache(cacheKey, result, 300);
    return res.json(result);
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch forms" });
  }
};

/* ======================================================
   GET SINGLE FORM
====================================================== */
export const getFormById = async (req, res) => {
  try {
    // Try Form first, then FormTemplate
    let form =
      (await Form.findById(req.params.id).populate("approvalFlow.approverId", "name email")) ||
      (await FormTemplate.findById(req.params.id).populate("workflow.approverId", "name email"));

    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    const sectionFieldCount = form.sections?.reduce((sum, s) => sum + (s.fields?.length || 0), 0) || 0;
    const totalFields = (form.fields?.length || 0) + sectionFieldCount;
    console.log(`Form ${req.params.id}: ${form.sections?.length || 0} sections, ${totalFields} total fields`);

    res.json({ success: true, data: form });
  } catch (error) {
    console.error("Get form by id error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch form: " + error.message });
  }
};

/* ======================================================
   UPDATE FORM
====================================================== */
export const updateForm = async (req, res) => {
  try {
    const { fields, sections, approvalFlow, approvalLevels } = req.body;

    // Validate layout
    const fieldsToValidate =
      sections?.length > 0 ? sections.flatMap((s) => s.fields || []) : fields || [];
    validateLayoutStructure(fieldsToValidate);

    // Build final payload
    const finalPayload = { ...req.body };
    if (approvalLevels || approvalFlow) {
      finalPayload.approvalFlow = mapApprovalFlow(approvalLevels || approvalFlow);
      delete finalPayload.approvalLevels;
    }

    // Fetch original + apply update in parallel
    const [originalForm, updated] = await Promise.all([
      Form.findById(req.params.id).lean(),
      Form.findByIdAndUpdate(req.params.id, finalPayload, { new: true }),
    ]);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Invalidate cache
    invalidateFormCache(req.user.role, req.user.plantId);

    // Notify approvers if workflow changed
    if (
      finalPayload.approvalFlow?.length > 0 &&
      JSON.stringify(originalForm?.approvalFlow) !== JSON.stringify(finalPayload.approvalFlow)
    ) {
      notifyApprovers({
        approvalFlow: finalPayload.approvalFlow,
        formId: updated._id,
        formName: updated.formName,
        actorId: req.user.userId,
        companyId: req.user.companyId,
        plantId: req.user.plantId,
      });
    }

    // Determine what changed for employee notifications
    const isStatusChange = originalForm?.status !== updated.status;
    const isNameChange = originalForm?.formName !== updated.formName;
    const isFieldChange =
      JSON.stringify(originalForm?.fields) !== JSON.stringify(updated.fields);

    if (isStatusChange || isNameChange || isFieldChange) {
      let title = "Form Updated";
      let message = `${updated.formName} has been updated`;

      if (isStatusChange) {
        title = "Form Status Changed";
        message = `${updated.formName} status changed to ${updated.status}`;
      } else if (isNameChange) {
        title = "Form Renamed";
        message = `Form renamed to "${updated.formName}"`;
      } else if (isFieldChange) {
        title = "Form Modified";
        message = `${updated.formName} fields have been updated`;
      }

      notifyEmployees(updated.plantId, title, message);
    }

    // Extra "now available" notification when newly published/approved
    const wasUnpublished =
      originalForm?.status !== "PUBLISHED" && originalForm?.status !== "APPROVED";
    const isNowPublished = updated.status === "PUBLISHED" || updated.status === "APPROVED";
    if (wasUnpublished && isNowPublished) {
      notifyEmployees(updated.plantId, "New Form Available", `${updated.formName} is now available`);
    }

    res.json({ success: true, message: "Form updated successfully", updated });
  } catch (error) {
    console.error("Update form error:", error);
    res.status(500).json({ success: false, message: error.message || "Update failed" });
  }
};

/* ======================================================
   ARCHIVE FORM
====================================================== */
export const archiveForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { status: "ARCHIVED", archivedAt: new Date() },
      { new: true }
    );
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    invalidateFormCache(req.user.role, req.user.plantId);
    res.json({ success: true, message: "Form archived successfully", data: form });
  } catch (error) {
    console.error("Archive form error:", error);
    res.status(500).json({ success: false, message: "Archive failed" });
  }
};

/* ======================================================
   RESTORE FORM
====================================================== */
export const restoreForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { status: "PUBLISHED", archivedAt: null },
      { new: true }
    );
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    invalidateFormCache(req.user.role, req.user.plantId);
    res.json({ success: true, message: "Form restored successfully", data: form });
  } catch (error) {
    console.error("Restore form error:", error);
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

/* ======================================================
   TOGGLE TEMPLATE STATUS
====================================================== */
export const toggleTemplateStatus = async (req, res) => {
  try {
    const { isTemplate } = req.body;

    const form = await Form.findById(req.params.id, "plantId");
    if (!form) return res.status(404).json({ success: false, message: "Form not found" });

    if (form.plantId.toString() !== req.user.plantId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this form" });
    }

    const updated = await Form.findByIdAndUpdate(req.params.id, { isTemplate }, { new: true });

    res.json({
      success: true,
      message: `Form ${isTemplate ? "saved as" : "removed from"} template successfully`,
      updated,
    });
  } catch (error) {
    console.error("Toggle template status error:", error);
    res.status(500).json({ success: false, message: "Toggle template status failed" });
  }
};

/* ======================================================
   DELETE FORM (SOFT DELETE)
====================================================== */
export const deleteForm = async (req, res) => {
  try {
    await Form.findByIdAndUpdate(req.params.id, { isActive: false });
    invalidateFormCache(req.user.role, req.user.plantId);
    res.json({ success: true, message: "Form removed successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};