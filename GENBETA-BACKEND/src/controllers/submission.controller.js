import Form from "../models/Form.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendSubmissionNotificationToApprover, sendSubmissionNotificationToPlant } from "../services/email/index.js";
import fs from "fs";
import { createNotification } from "../utils/notify.js";

/* ======================================================
   CREATE SUBMISSION
====================================================== */
export const createSubmission = async (req, res) => {
  try {
    const { 
      formId, 
      data, 
      status = "DRAFT"
    } = req.body;
    
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ 
        success: false, 
        message: "Form not found" 
      });
    }

    // Process files if any
    const files = [];
    let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(fs.readFileSync(file.path), 'submissions', file.originalname);
          files.push({
            fieldId: file.fieldname,
            filename: file.filename,
            originalName: file.originalname,
            url: result.secure_url,
            mimetype: file.mimetype,
            size: file.size
          });
          parsedData[file.fieldname] = result.secure_url;
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("File upload error:", file.originalname, uploadError);
          fs.unlinkSync(file.path);
        }
      }
    }

    // Determine initial status
    const hasApprovalFlow = form.approvalFlow && form.approvalFlow.length > 0;
    const initialStatus = status === "SUBMITTED" && hasApprovalFlow 
      ? "PENDING_APPROVAL" 
      : status;

    const submissionData = {
      formId: form._id,
      formName: form.formName,
      submittedBy: userId,
      submittedByName: user.name,
      submittedByEmail: user.email,
      data: parsedData,
      files: files,
      status: initialStatus,
      companyId: user.companyId,
      plantId: user.plantId,
      currentLevel: initialStatus === "PENDING_APPROVAL" ? 1 : 0
    };

    const submission = await FormSubmission.create(submissionData);

    // Trigger notification to plant admin when employee submits form
    if (initialStatus === "PENDING_APPROVAL") {
      try {
        // Find the plant admin for this submission
        const plantAdmin = await User.findOne({
          plantId: user.plantId,
          role: "PLANT_ADMIN"
        });

        if (plantAdmin) {
          await createNotification({
            userId: plantAdmin._id,
            title: "New Form Submitted",
            message: `${user.name} submitted ${form.formName}`,
            link: `/plant/submissions`
          });
          console.log(`Notification sent to plant admin ${plantAdmin._id} for form submission`);
          
          // Send email notification to plant admin with form data
          try {
            const company = await Company.findById(user.companyId);
            const plant = await Plant.findById(user.plantId);
            
            const submissionDetailViewLink = `${process.env.FRONTEND_URL || "https://login.matapangtech.com"}/plant/submissions/${submission._id?.toString() || ""}`;
            
            await sendSubmissionNotificationToPlant(
              plantAdmin.email,
              form.formName,
              user.name,
              submission.submittedAt,
              "https://login.matapangtech.com/employee/approval/pending",
              parsedData,
              form.fields || [],
              company || {},
              plant || {},
              user.plantId?.toString() || "",
              form.formId || form._id?.toString() || "",
              submission._id?.toString() || "",
              "EMPLOYEE",
              user.companyId,
              submissionDetailViewLink
            );
            console.log(`Email notification sent to plant admin ${plantAdmin.email} for form submission`);
          } catch (emailError) {
            console.error("Failed to send email notification to plant admin:", emailError);
          }
        }
        
        // Also notify the first approver in the workflow
        if (form.approvalFlow && form.approvalFlow.length > 0) {
          // Find the first level approver in the workflow
          const firstLevelApprover = form.approvalFlow.find(level => level.level === 1);
          if (firstLevelApprover && firstLevelApprover.approverId) {
            const approver = await User.findById(firstLevelApprover.approverId);
            if (approver) {
              await createNotification({
                userId: approver._id,
                title: "Approval Required",
                message: `Form ${form.formName} waiting for your approval`,
                link: `/employee/approvals/${submission._id}`
              });
              console.log(`Notification sent to approver ${approver._id} for form approval`);
            }
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission
    });

  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create submission",
      error: error.message 
    });
  }
};

/* ======================================================
   GET ALL SUBMISSIONS
====================================================== */
export const getSubmissions = async (req, res) => {
  try {
    const { 
      formId, 
      status, 
      page = 1, 
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isArchived: false };
    
    // Role-based filtering
    if (req.user.role === "PLANT_ADMIN") {
      filter.plantId = req.user.plantId;
    } else if (req.user.role === "COMPANY_ADMIN") {
      filter.companyId = req.user.companyId;
    } else if (req.user.role === "EMPLOYEE") {
      filter.submittedBy = req.user.userId;
    }

    if (formId) filter.formId = formId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const submissions = await FormSubmission.find(filter)
      .populate("submittedBy", "name email")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .populate("formId", "formName approvalFlow workflow")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FormSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch submissions" 
    });
  }
};

/* ======================================================
   GET SUBMISSION BY ID
====================================================== */
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const submission = await FormSubmission.findById(id)
      .populate({
        path: "formId",
        select: "formName approvalFlow workflow fields sections",
        populate: [
          {
            path: "approvalFlow.approverId",
            select: "name email"
          },
          {
            path: "workflow.approverId",
            select: "name email"
          }
        ]
      })
      .populate("submittedBy", "name email")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .populate("companyId", "name")
      .populate("plantId", "name");

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: "Submission not found" 
      });
    }

    // Authorization check
    if (req.user.role === "EMPLOYEE") {
      console.log("Employee access check for submission:", submission._id);
      console.log("User ID:", req.user.userId);
      console.log("Submitter ID:", submission.submittedBy._id.toString());
      console.log("Submission status:", submission.status);
      console.log("Current level:", submission.currentLevel);
      
      // Allow the submitter to view their own submission
      if (submission.submittedBy._id.toString() === req.user.userId) {
        console.log("User is submitter - allowing access");
        // User is the submitter - allow access
      } 
      // Allow approvers to view submissions they need to approve
      else if (submission.status === "PENDING_APPROVAL" && submission.currentLevel > 0) {
        console.log("Checking approver access");
        // Check if this user is the approver for the current level
        const form = submission.formId;
        console.log("Form approval flow:", JSON.stringify(form?.approvalFlow, null, 2));
        const flow = form?.approvalFlow || [];
        const currentApprover = flow.find(f => f.level === submission.currentLevel);
        console.log("Current approver level:", submission.currentLevel);
        console.log("Found approver:", JSON.stringify(currentApprover, null, 2));
        
        if (currentApprover) {
          // Handle different possible structures for approverId
          let approverId = null;
          if (currentApprover.approverId) {
            if (typeof currentApprover.approverId === 'string') {
              approverId = currentApprover.approverId;
            } else if (currentApprover.approverId._id) {
              approverId = currentApprover.approverId._id.toString();
            } else if (currentApprover.approverId.toString) {
              approverId = currentApprover.approverId.toString();
            }
          }
          
          console.log("Approver ID:", approverId);
          console.log("User ID:", req.user.userId.toString());
          
          if (approverId && approverId === req.user.userId.toString()) {
            console.log("User is current approver - allowing access");
            // User is the current approver - allow access
          } else {
            console.log("User is not current approver");
            console.log("Expected approver ID:", approverId);
            console.log("Actual user ID:", req.user.userId.toString());
            return res.status(403).json({ 
              success: false, 
              message: "Access denied - you are not the current approver for this submission" 
            });
          }
        } else {
          console.log("No approver found for current level");
          return res.status(403).json({ 
            success: false, 
            message: "Access denied - no approver found for current level" 
          });
        }
      } else {
        console.log("User cannot access this submission");
        return res.status(403).json({ 
          success: false, 
          message: "Access denied - you can only view your own submissions or submissions you need to approve" 
        });
      }
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch submission" 
    });
  }
};

/* ======================================================
   UPDATE SUBMISSION
====================================================== */
export const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, status } = req.body;

    const submission = await FormSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: "Submission not found" 
      });
    }

    // Authorization check
    if (req.user.role === "EMPLOYEE" && submission.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    // Only allow updating DRAFT submissions
    if (submission.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false, 
        message: "Only draft submissions can be updated" 
      });
    }

    if (data) {
      submission.data = typeof data === 'string' ? JSON.parse(data) : data;
    }

    if (status) {
      submission.status = status;
    }

    const updated = await submission.save();

    res.json({
      success: true,
      message: "Submission updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update submission" 
    });
  }
};

/* ======================================================
   DELETE SUBMISSION
====================================================== */
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: "Submission not found" 
      });
    }

    // Authorization check
    if (req.user.role === "EMPLOYEE" && submission.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    // Only allow deleting DRAFT submissions
    if (submission.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false, 
        message: "Only draft submissions can be deleted" 
      });
    }

    await FormSubmission.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Submission deleted successfully"
    });

  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete submission" 
    });
  }
};

/* ======================================================
   SUBMIT DRAFT SUBMISSION
====================================================== */
export const submitDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id).populate("formId", "formName approvalFlow workflow fields sections");
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: "Submission not found" 
      });
    }

    // Authorization check
    if (req.user.role === "EMPLOYEE" && submission.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    if (submission.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false, 
        message: "Only draft submissions can be submitted" 
      });
    }

    const form = submission.formId;
    const hasApprovalFlow = form?.approvalFlow && form.approvalFlow.length > 0;
    const newStatus = hasApprovalFlow ? "PENDING_APPROVAL" : "APPROVED";

    submission.status = newStatus;
    submission.submittedAt = new Date();
    submission.currentLevel = newStatus === "PENDING_APPROVAL" ? 1 : 0;

    if (newStatus === "APPROVED") {
      submission.approvedAt = new Date();
      submission.approvedBy = req.user.userId;
    }

    const updated = await submission.save();

    // Trigger notification to plant admin when employee submits form
    if (newStatus === "PENDING_APPROVAL") {
      try {
        // Find the plant admin for this submission
        const plantAdmin = await User.findOne({
          plantId: submission.plantId,
          role: "PLANT_ADMIN"
        });

        if (plantAdmin) {
          await createNotification({
            userId: plantAdmin._id,
            title: "New Form Submitted",
            message: `${submission.submittedByName} submitted ${form.formName}`,
            link: `/plant/submissions`
          });
          console.log(`Notification sent to plant admin ${plantAdmin._id} for form submission from submitDraft`);
          
          // Send email notification to plant admin with form data
          try {
            const company = await Company.findById(submission.companyId);
            const plant = await Plant.findById(submission.plantId);
            
            const submissionDetailViewLink = `${process.env.FRONTEND_URL || "https://login.matapangtech.com"}/plant/submissions/${submission._id?.toString() || ""}`;
            
            await sendSubmissionNotificationToPlant(
              plantAdmin.email,
              form.formName,
              submission.submittedByName,
              submission.submittedAt,
              "https://login.matapangtech.com/employee/approval/pending",
              submission.data || {},
              form.fields || [],
              company || {},
              plant || {},
              submission.plantId?.toString() || "",
              form.formId || form._id?.toString() || "",
              submission._id?.toString() || "",
              "EMPLOYEE",
              submission.companyId,
              submissionDetailViewLink
            );
            console.log(`Email notification sent to plant admin ${plantAdmin.email} for form submission from submitDraft`);
          } catch (emailError) {
            console.error("Failed to send email notification to plant admin from submitDraft:", emailError);
          }
        }
        
        // Also notify the first approver in the workflow
        if (form.approvalFlow && form.approvalFlow.length > 0) {
          // Find the first level approver in the workflow
          const firstLevelApprover = form.approvalFlow.find(level => level.level === 1);
          if (firstLevelApprover && firstLevelApprover.approverId) {
            const approver = await User.findById(firstLevelApprover.approverId);
            if (approver) {
              await createNotification({
                userId: approver._id,
                title: "Approval Required",
                message: `Form ${form.formName} waiting for your approval`,
                link: `/employee/approvals/${submission._id}`
              });
              console.log(`Notification sent to approver ${approver._id} for form approval from submitDraft`);
            }
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    res.json({
      success: true,
      message: "Submission submitted successfully",
      data: updated
    });

  } catch (error) {
    console.error("Submit draft error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit submission" 
    });
  }
};

/* ======================================================
   GET SUBMISSION STATS
====================================================== */
export const getSubmissionStats = async (req, res) => {
  try {
    const filter = { isArchived: false };
    
    if (req.user.role === "PLANT_ADMIN") {
      filter.plantId = req.user.plantId;
    } else if (req.user.role === "COMPANY_ADMIN") {
      filter.companyId = req.user.companyId;
    } else if (req.user.role === "EMPLOYEE") {
      filter.submittedBy = req.user.userId;
    }

    const stats = await FormSubmission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      draft: 0,
      submitted: 0,
      pending_approval: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      const statusKey = stat._id.toLowerCase().replace('-', '_');
      formattedStats[statusKey] = stat.count;
    });

    const total = Object.values(formattedStats).reduce((sum, count) => sum + count, 0);
    formattedStats.total = total;

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch statistics" 
    });
  }
};