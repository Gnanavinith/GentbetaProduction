import FormTask from "../models/FormTask.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import Form from "../models/Form.model.js";
import FormTemplate from "../models/FormTemplate.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import { sendApprovalEmail, sendSubmissionNotificationToApprover } from "../services/email/index.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { isCompanyOverLimit } from "../utils/planLimits.js";
import mongoose from "mongoose";
import { createNotification } from "../utils/notify.js";

export const getAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const tasks = await FormTask.find({
      assignedTo: userId,
      status: "pending"
    })
    .populate("formId", "formName formId fields sections")
    .populate("assignedBy", "name email")
    .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get assigned tasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assigned tasks" });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const pendingCount = await FormTask.countDocuments({
      assignedTo: userId,
      status: "pending"
    });

    const completedCount = await FormTask.countDocuments({
      assignedTo: userId,
      status: "completed"
    });

    res.json({ 
      success: true, 
      data: { pendingCount, completedCount } 
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task stats" });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { data } = req.body;
    const userId = req.user.userId;

    // Process files if any
    const files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          if (!file.path) {
            console.error("File path missing for:", file.fieldname);
            continue;
          }
          
          const result = await uploadToCloudinary(fs.readFileSync(file.path), 'submissions', file.originalname);
          files.push({
            fieldId: file.fieldname,
            filename: file.filename,
            originalName: file.originalname,
            url: result.secure_url,
            mimetype: file.mimetype,
            size: file.size
          });
          if (typeof data === 'string') {
            const parsedData = JSON.parse(data);
            parsedData[file.fieldname] = result.secure_url;
            data = JSON.stringify(parsedData);
          } else {
            data[file.fieldname] = result.secure_url;
          }
          
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("File upload error:", file.originalname, uploadError);
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    const task = await FormTask.findById(taskId).populate({
      path: "formId",
      select: "formName formId fields sections approvalFlow workflow companyId plantId"
    });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to submit this task" });
    }

    if (task.status === "completed") {
      return res.status(400).json({ success: false, message: "This task has already been completed" });
    }

    const form = task.formId;
    if (!form) {
      return res.status(404).json({ success: false, message: "Form definition not found for this task" });
    }

    console.log('Task form fields loaded:', form.fields?.length || 0);
    console.log('Task sample field with includeInApprovalEmail:', form.fields?.[0]?.includeInApprovalEmail);

    const hasFlow = form?.approvalFlow && form.approvalFlow.length > 0;
    const finalStatus = hasFlow ? "PENDING_APPROVAL" : "APPROVED";

    const submissionData = {
      formId: form._id,
      plantId: task.plantId || req.user.plantId,
      companyId: task.companyId || req.user.companyId,
      submittedBy: userId.toString(),
      data: typeof data === 'string' ? JSON.parse(data) : data,
      files: files,
      status: finalStatus,
      currentLevel: finalStatus === "PENDING_APPROVAL" ? 1 : 0,
      submittedAt: new Date()
    };

    const submission = await FormSubmission.create(submissionData);

    // Notify first approver if sequential approval is required (non-blocking)
    if (finalStatus === "PENDING_APPROVAL") {
      setImmediate(async () => {
        try {
          const firstLevel = form.approvalFlow.find(f => f.level === 1);
          if (!firstLevel) return;
          
          const company = await Company.findById(submissionData.companyId);
          const plant = await Plant.findById(submissionData.plantId);
          const plantIdStr = plant?._id?.toString() || submissionData.plantId?.toString() || "";
          const formCode = form.formId || `create-${form.numericalId}` || 'FORM';
          const submissionIdStr = submission._id?.toString() || "";
          const approvalLink = `${process.env.FRONTEND_URL}/employee/approvals/${submission._id}`;

          if (firstLevel.type === "GROUP" && firstLevel.groupId) {
            // Notify all group members
            const ApprovalGroup = mongoose.model("ApprovalGroup");
            const group = await ApprovalGroup.findById(firstLevel.groupId)
              .populate("members", "name email _id")
              .lean();

            if (group?.members?.length > 0) {
              for (const member of group.members) {
                try {
                  await createNotification({
                    userId: member._id,
                    title: "Group Approval Required",
                    message: `${req.user.name || "An employee"} submitted "${form.formName}" (${formCode}) — your group (${group.groupName}) needs to approve it`,
                    link: `/employee/approvals/${submission._id}`
                  });
                  console.log(`✅ In-app notification created for group member ${member.name} (${member.email}) [formTask] - Form Code: ${formCode}`);
                } catch (notifError) {
                  console.error(`❌ Failed to create notification for ${member.name}:`, notifError.message);
                }

                if (member.email) {
                  try {
                    const previousApprovals = (submission.approvalHistory || []).map(h => ({
                      name: h.name || "Unknown Approver",
                      date: h.actionedAt || h.date,
                      status: h.status || "APPROVED",
                      comments: h.comments || ""
                    }));
                    
                    await sendSubmissionNotificationToApprover(
                      member.email,
                      form.formName,                    // ✅ use form.formName directly
                      req.user.name || "Employee",      // ✅ use req.user.name directly
                      submissionData.submittedAt,
                      approvalLink,
                      previousApprovals,
                      company,
                      plant,
                      plantIdStr,
                      formIdStr,
                      submissionIdStr,
                      form.fields || [],                // ✅ pass form fields
                      submissionData.data || {},        // ✅ pass submission data
                      "PLANT_ADMIN",                    // ✅ actor
                      submissionData.companyId,         // ✅ companyId
                      req.user.email || null,           // ✅ submitter email
                      formCode                          // ✅ form code
                    );
                    console.log(`Email sent to group member ${member.email} (${member.name})`);
                  } catch (emailErr) {
                    console.error(`Failed to send email to ${member.email}:`, emailErr);
                  }
                }
              }
            }
          } else if (firstLevel.approverId) {
            // Individual approver
            const approver = await User.findById(firstLevel.approverId);
            if (approver?.email) {
              await sendSubmissionNotificationToApprover(
                approver.email,
                form.formName,
                req.user.name || "Employee",
                submissionData.submittedAt,
                approvalLink,
                [],
                company,
                plant,
                plantIdStr,
                formIdStr,
                submissionIdStr,
                form.fields || [],
                submissionData.data || {},
                "PLANT_ADMIN",
                submissionData.companyId,
                req.user.email || null,
                formCode
              );
            }
          }
        } catch (emailError) {
          console.error("Failed to notify first approver:", emailError);
        }
      });
    }

    task.status = "completed";
    task.completedAt = new Date();
    task.submissionId = submission._id;
    await task.save();

    res.json({ 
      success: true, 
      message: "Form submitted successfully", 
      submission 
    });
  } catch (error) {
    console.error("Submit task error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit form",
      error: error.message,
      details: error.errors
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const task = await FormTask.findById(taskId)
      .populate("formId", "formName formId fields sections approvalFlow")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this task" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("Get task by id error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};

export const createTasks = async (req, res) => {
  try {
    const { formIds, assignedTo, dueDate } = req.body;
    const { userId, plantId, companyId } = req.user;

    if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
      return res.status(400).json({ success: false, message: "At least one form is required" });
    }

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: "Employee assignment is required" });
    }

    const tasks = await Promise.all(
      formIds.map(async (formId) => {
        return await FormTask.create({
          formId,
          assignedTo,
          assignedBy: userId,
          plantId,
          companyId,
          dueDate,
          status: "pending"
        });
      })
    );

    try {
      const employee = await User.findById(assignedTo);
      const forms = await Form.find({ _id: { $in: formIds } });
      const company = await Company.findById(companyId);
      const plant = await Plant.findById(plantId);
      
      if (employee && employee.email) {
        const formNames = forms.map(f => f.formName).join(", ");
        const dashboardLink = `${process.env.FRONTEND_URL}/employee/dashboard`;
        await sendApprovalEmail(employee.email, `New Assigned Forms: ${formNames}`, null, dashboardLink, company, plant);
      }
    } catch (emailError) {
      console.error("Failed to notify employee of new tasks:", emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: `${tasks.length} task(s) assigned successfully`, 
      tasks 
    });
  } catch (error) {
    console.error("Create tasks error:", error);
    res.status(500).json({ success: false, message: "Failed to assign forms" });
  }
};

export const submitFormDirectly = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let form = await Form.findById(formId).select("formName formId fields sections approvalFlow status companyId plantId workflow");
    
    if (!form) {
      form = await FormTemplate.findById(formId).select("templateName formId fields sections workflow status companyId plantId");
    }

    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    console.log('Form fields loaded:', form.fields?.length || 0);
    console.log('Sample field with includeInApprovalEmail:', form.fields?.[0]?.includeInApprovalEmail);

    const formStatus = form.status || form.formStatus;
    if (formStatus !== "APPROVED" && formStatus !== "PUBLISHED") {
      return res.status(400).json({ success: false, message: "This form is not yet published and available for submission" });
    }

    let data;
    if (req.body.data) {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } else {
      data = req.body;
    }

    const files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          if (!file.path) {
            console.error("File path missing for:", file.fieldname);
            continue;
          }
          
          const result = await uploadToCloudinary(fs.readFileSync(file.path), 'submissions', file.originalname);
          files.push({
            fieldId: file.fieldname,
            filename: file.filename,
            originalName: file.originalname,
            url: result.secure_url,
            mimetype: file.mimetype,
            size: file.size
          });
          data[file.fieldname] = result.secure_url;
          
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("File upload error:", file.originalname, uploadError);
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    const workflow = form.workflow || form.approvalFlow || [];
    const hasFlow = workflow && workflow.length > 0;
    const finalStatus = hasFlow ? "PENDING_APPROVAL" : "APPROVED";

    const submissionData = {
      formId: form._id,
      formName: form.formName || form.templateName || "Untitled Form",
      plantId: form.plantId || user.plantId,
      companyId: form.companyId || user.companyId,
      submittedBy: userId,
      submittedByName: user.name || "",
      submittedByEmail: user.email || "",
      data: data,
      files: files,
      status: finalStatus,
      currentLevel: finalStatus === "PENDING_APPROVAL" ? 1 : 0,
      submittedAt: new Date()
    };

    const submission = await FormSubmission.create(submissionData);

    if (hasFlow && finalStatus === "PENDING_APPROVAL") {
      try {
        for (const approvalLevel of workflow) {
          if (approvalLevel.type !== "GROUP" && approvalLevel.approverId) {
            await FormTask.create({
              formId: form._id,
              assignedTo: approvalLevel.approverId,
              assignedBy: userId,
              plantId: submissionData.plantId,
              companyId: submissionData.companyId,
              status: "pending"
            });
          }
        }

        // Notify first level approver (non-blocking)
        setImmediate(async () => {
          try {
            const firstLevel = workflow.find(f => f.level === 1) || workflow[0];
            if (!firstLevel) return;

            const company = await Company.findById(submissionData.companyId);
            const plant = await Plant.findById(submissionData.plantId);
            const plantIdStr = plant?._id?.toString() || submissionData.plantId?.toString() || "";
            const formCode = form.formId || `create-${form.numericalId}` || 'FORM';
            const submissionIdStr = submission._id?.toString() || "";
            const approvalLink = `${process.env.FRONTEND_URL}/employee/approvals/${submission._id}`;

            if (firstLevel.type === "GROUP" && firstLevel.groupId) {
              // Group approver — notify all members
              const ApprovalGroup = mongoose.model("ApprovalGroup");
              const group = await ApprovalGroup.findById(firstLevel.groupId)
                .populate("members", "name email _id")
                .lean();

              if (group?.members?.length > 0) {
                for (const member of group.members) {
                  try {
                    await createNotification({
                      userId: member._id,
                      title: "Group Approval Required",
                      message: `${submissionData.submittedByName || "An employee"} submitted "${submissionData.formName}" (${formCode}) — your group (${group.groupName}) needs to approve it`,
                      link: `/employee/approvals/${submission._id}`
                    });
                    console.log(`✅ In-app notification created for group member ${member.name} (${member.email}) [formTask-submitDraft] - Form Code: ${formCode}`);
                  } catch (notifError) {
                    console.error(`❌ Failed to create notification for ${member.name}:`, notifError.message);
                  }

                  if (member.email) {
                    try {
                      await sendSubmissionNotificationToApprover(
                        member.email,
                        submissionData.formName,
                        submissionData.submittedByName,
                        submissionData.submittedAt,
                        approvalLink,
                        [],
                        company,
                        plant,
                        plantIdStr,
                        formIdStr,
                        submissionIdStr,
                        form.fields || [],                       // ✅ FIXED: was missing
                        submissionData.data || {},               // ✅ FIXED: was missing
                        "PLANT_ADMIN",                           // ✅ FIXED: was missing
                        submissionData.companyId,                // ✅ FIXED: was missing
                        submissionData.submittedByEmail || null,  // ✅ FIXED: was missing
                        formCode                                 // ✅ ADD FORM CODE
                      );
                      console.log(`Email sent to group member ${member.email} (${member.name})`);
                    } catch (emailErr) {
                      console.error(`Failed to send email to ${member.email}:`, emailErr);
                    }
                  }
                }
              }
            } else if (firstLevel.approverId) {
              // Individual approver
              const approver = await User.findById(firstLevel.approverId);
              if (approver?.email) {
                await sendSubmissionNotificationToApprover(
                  approver.email,
                  submissionData.formName,
                  submissionData.submittedByName,
                  submissionData.submittedAt,
                  approvalLink,
                  [],
                  company,
                  plant,
                  plantIdStr,
                  formIdStr,
                  submissionIdStr,
                  form.fields || [],
                  submissionData.data || {},
                  "PLANT_ADMIN",
                  submissionData.companyId,
                  submissionData.submittedByEmail || null,
                  formCode
                );
              }
            }
          } catch (notifyErr) {
            console.error("Failed to notify approver:", notifyErr);
          }
        });
      } catch (taskError) {
        console.error("Failed to create approval tasks:", taskError);
      }
    }

    res.json({ 
      success: true, 
      message: "Form submitted successfully", 
      submission 
    });
  } catch (error) {
    console.error("Submit form directly error:", error);
    res.status(500).json({ success: false, message: "Failed to submit form" });
  }
};