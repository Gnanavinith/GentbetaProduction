import Form from "../models/Form.model.js";
import FormTemplate from "../models/FormTemplate.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import Assignment from "../models/Assignment.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import { sendApprovalEmail, sendFormCreatedApproverNotification } from "../services/email/index.js";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache, warmCache, getCacheStats } from "../utils/cache.js";
import { generateFormId } from "../utils/formIdGenerator.js";
import { checkFormCreationLimit } from "../utils/subscriptionValidator.js";
import { createNotification } from "../utils/notify.js";

// Helper function to validate layout structure
function validateLayoutStructure(fields) {
  if (!fields || !Array.isArray(fields)) return;
  
  fields.forEach(field => {

    
    // For grid-table, ensure it has proper structure
    if (field.type === "grid-table") {
      if (field.columns && !Array.isArray(field.columns)) {
        throw new Error("Grid-table fields must have 'columns' property as an array");
      }
      if (field.items && !Array.isArray(field.items)) {
        throw new Error("Grid-table fields must have 'items' property as an array");
      }
    }
  });
}

/* ======================================================
   CREATE FORM
====================================================== */
export const createForm = async (req, res) => {
  try {
    const { formId: providedFormId, formName, fields, sections, approvalFlow, approvalLevels, description, status } = req.body;

    // Validate layout structure - prefer sections fields, fall back to root fields for legacy forms
    const allFieldsToValidate = (sections && sections.length > 0) 
      ? sections.flatMap(s => s.fields || [])
      : (fields || []);
    validateLayoutStructure(allFieldsToValidate);

    // Check form creation limit before creating the form
    const limitCheck = await checkFormCreationLimit(req.user.plantId, req.user.companyId);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: limitCheck.message,
        overLimit: true,
        upgradeRequired: limitCheck.upgradeRequired,
        currentCount: limitCheck.currentCount,
        limit: limitCheck.limit
      });
    }

    // Generate formId if not provided
    let finalFormId = providedFormId || generateFormId(formName);
    
    // Ensure the formId is unique
    if (!providedFormId) { // Only check uniqueness if we generated the ID
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!isUnique && attempts < maxAttempts) {
        try {
          const existingForm = await Form.findOne({ formId: finalFormId });
          if (!existingForm) {
            isUnique = true;
          } else {
            // Generate a new ID with additional randomness
            finalFormId = generateFormId(formName + Date.now().toString());
            attempts++;
          }
        } catch (error) {
          console.error('Error checking formId uniqueness:', error);
          isUnique = true; // Proceed anyway to avoid blocking the creation
        }
      }
    } else {
      finalFormId = providedFormId; // Use the provided ID
    }

    // Map approvalLevels from frontend to approvalFlow for backend
    const finalApprovalFlow = (approvalLevels || approvalFlow || []).map((level, index) => ({
      level: index + 1,
      approverId: level.approverId,
      name: level.name || `Level ${index + 1}`,
      description: level.description || ""
    }));

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
      isTemplate: req.body.isTemplate || false
    });

    console.log('Created form with status:', form.status, 'and ID:', form._id);

    // Invalidate cache for forms list
    try {
      const cacheKey = generateCacheKey('forms', { 
        page: 1, 
        limit: 10, 
        role: req.user.role,
        plantId: req.user.plantId 
      });
      console.log('Invalidating cache key in createForm:', cacheKey);
      await deleteFromCache(cacheKey);
      console.log('Cache invalidated successfully in createForm');
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }

    res.status(201).json({
      success: true,
      message: "Form created successfully",
      form
    });

    // Trigger notification to assigned employees when form is published during creation
    if (form.status === 'PUBLISHED' || form.status === 'APPROVED') {
      try {
        // Find all employees assigned to this plant
        const employees = await User.find({
          plantId: form.plantId,
          role: "EMPLOYEE",
          isActive: true
        });

        for (const employee of employees) {
          await createNotification({
            userId: employee._id,
            title: "New Form Available",
            message: `${form.formName} is now available`,
            link: `/employee/forms-view`
          });
        }
      } catch (notificationError) {
        console.error("Error creating form published notification:", notificationError);
      }
    }

    // Send email notifications to all approvers (non-blocking)
    if (finalApprovalFlow.length > 0) {
      (async () => {
        try {
          const creator = await User.findById(req.user.userId);
          const company = await Company.findById(req.user.companyId);
          const plant = await Plant.findById(req.user.plantId);
          
          for (const level of finalApprovalFlow) {
            const approver = await User.findById(level.approverId);
            if (approver && approver.email) {
              const reviewLink = `${process.env.FRONTEND_URL}/plant/forms/${form._id}`;
              await sendFormCreatedApproverNotification(
                approver.email,
                form.formName,
                form.formId, // Pass the formId
                creator?.name || "A plant admin",
                reviewLink,
                company,
                plant
              );
            }
          }
        } catch (emailErr) {
          console.error("Failed to send form created notifications:", emailErr);
        }
      })();
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
    const filter = { isActive: true };

      if (req.user.role === "PLANT_ADMIN") {
        filter.plantId = req.user.plantId;
        } else if (req.user.role === "EMPLOYEE") {
          filter.plantId = req.user.plantId;
          // Employee can see all published forms (whether templates or regular forms)
          filter.status = { $in: ["APPROVED", "PUBLISHED"] };
        }

    console.log(`User role: ${req.user.role}`);
    console.log(`User plantId: ${req.user.plantId}`);
    console.log(`Applied filter:`, JSON.stringify(filter, null, 2));

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Generate cache key
    const cacheParams = { page, limit, role: req.user.role };
    if (filter.plantId) cacheParams.plantId = filter.plantId;
    if (filter.$and) {
      const statusCondition = filter.$and.find(cond => cond.status);
      const isTemplateCondition = filter.$and.find(cond => cond.$or);
      if (statusCondition) cacheParams.status = JSON.stringify(statusCondition.status);
      if (isTemplateCondition) cacheParams.isTemplateConditions = 'employee_specific';
    } else if (filter.status) {
      cacheParams.status = JSON.stringify(filter.status);
    }
    const cacheKey = generateCacheKey('forms', cacheParams);
    
    console.log('Generated cache key:', cacheKey);
    console.log('Cache params:', cacheParams);
    console.log('Filter:', filter);
    
    // Try to get from cache first
    let cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log('Returning cached result for key:', cacheKey);
      return res.json(cachedResult);
    }
    console.log('No cache hit, fetching from database');

    // Count total forms for pagination metadata
    const total = await Form.countDocuments(filter);
    console.log(`Total forms matching filter: ${total}`);

    // Get paginated forms
    const forms = await Form.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${forms.length} forms`);
    if (forms.length > 0) {
      console.log('Sample forms:');
      forms.slice(0, 3).forEach(form => {
        console.log(`  - ${form.formName} (status: ${form.status}, isTemplate: ${form.isTemplate})`);
      });
    }

    const data = await Promise.all(
      forms.map(async (form) => {
        let submissionCount = 0;
        try {
          submissionCount = await FormSubmission.countDocuments({ formId: form._id });
        } catch (err) {
          console.error(`Error counting submissions for form ${form._id}:`, err);
        }
        return {
          ...form.toObject(),
          id: form._id,
          submissionCount
        };
      })
    );
    
    const result = { 
      success: true, 
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
    
    // Cache the result for 5 minutes
    await setInCache(cacheKey, result, 300);

    res.json(result);
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
    // First, try to find in Form model
    let form = await Form.findById(req.params.id).populate("approvalFlow.approverId", "name email");
    
    if (!form) {
      // If not found in Form model, try FormTemplate model
      form = await FormTemplate.findById(req.params.id).populate("workflow.approverId", "name email");
    }
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    
    // Log the number of fields to help debug
    console.log(`Form ${req.params.id} has ${form.fields?.length || 0} top-level fields and ${form.sections?.length || 0} sections`);
    if (form.sections && form.sections.length > 0) {
      form.sections.forEach((section, index) => {
        console.log(`Section ${index} has ${section.fields?.length || 0} fields`);
      });
    }
    
    // Calculate total fields across all sections and top level
    const totalFields = (form.fields?.length || 0) + 
      (form.sections?.reduce((sum, section) => sum + (section.fields?.length || 0), 0) || 0);
    console.log(`Total fields in form ${req.params.id}: ${totalFields}`);
    
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
    const { formId, formName, fields, sections, approvalFlow, approvalLevels, description } = req.body;

    // Validate layout structure - prefer sections fields, fall back to root fields for legacy forms
    const allFieldsToValidate = (sections && sections.length > 0) 
      ? sections.flatMap(s => s.fields || [])
      : (fields || []);
    validateLayoutStructure(allFieldsToValidate);

    // Map approvalLevels from frontend to approvalFlow for backend if provided
    let finalPayload = { ...req.body };
    
    if (approvalLevels || approvalFlow) {
      finalPayload.approvalFlow = (approvalLevels || approvalFlow || []).map((level, index) => ({
        level: index + 1,
        approverId: level.approverId,
        name: level.name || `Level ${index + 1}`,
        description: level.description || ""
      }));
      delete finalPayload.approvalLevels;
    }

    // Get the original form to check if approval workflow is being added/changed
    const originalForm = await Form.findById(req.params.id);
    
    const updated = await Form.findByIdAndUpdate(
      req.params.id,
      finalPayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Invalidate cache for forms list
    try {
      const cacheKey = generateCacheKey('forms', { 
        page: 1, 
        limit: 10, 
        role: req.user.role,
        plantId: req.user.plantId 
      });
      await deleteFromCache(cacheKey);
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }

    // Send email notifications to approvers when workflow is assigned/updated
    if (finalPayload.approvalFlow && finalPayload.approvalFlow.length > 0) {
      // Check if this is a new workflow assignment or an update
      const isWorkflowUpdate = !originalForm.approvalFlow || originalForm.approvalFlow.length === 0 || 
                              JSON.stringify(originalForm.approvalFlow) !== JSON.stringify(finalPayload.approvalFlow);
      
      if (isWorkflowUpdate) {
        (async () => {
          try {
            const updater = await User.findById(req.user.userId);
            const company = await Company.findById(req.user.companyId);
            const plant = await Plant.findById(req.user.plantId);
            
            for (const level of finalPayload.approvalFlow) {
              const approver = await User.findById(level.approverId);
              if (approver && approver.email) {
                const reviewLink = `${process.env.FRONTEND_URL}/plant/forms/${updated._id}`;
                await sendFormCreatedApproverNotification(
                  approver.email,
                  updated.formName,
                  updater?.name || "A plant admin",
                  reviewLink,
                  company,
                  plant,
                  "PLANT_ADMIN",
                  req.user.companyId,
                  req.user.plantId
                );
              }
            }
          } catch (emailErr) {
            console.error("Failed to send workflow assignment notifications:", emailErr);
          }
        })();
      }
    }

    // Send notification to all employees when form is significantly updated
    try {
      // Find all employees assigned to this plant
      const employees = await User.find({
        plantId: updated.plantId,
        role: "EMPLOYEE",
        isActive: true
      });

      // Check if this is a significant update (status change, name change, or field changes)
      const isStatusChange = originalForm.status !== updated.status;
      const isNameChange = originalForm.formName !== updated.formName;
      const isFieldChange = JSON.stringify(originalForm.fields) !== JSON.stringify(updated.fields);
      
      if (isStatusChange || isNameChange || isFieldChange) {
        let notificationTitle = "Form Updated";
        let notificationMessage = `${updated.formName} has been updated`;
        
        if (isStatusChange) {
          notificationTitle = "Form Status Changed";
          notificationMessage = `${updated.formName} status changed to ${updated.status}`;
        } else if (isNameChange) {
          notificationTitle = "Form Renamed";
          notificationMessage = `Form renamed to "${updated.formName}"`;
        } else if (isFieldChange) {
          notificationTitle = "Form Modified";
          notificationMessage = `${updated.formName} fields have been updated`;
        }
          
        for (const employee of employees) {
          await createNotification({
            userId: employee._id,
            title: notificationTitle,
            message: notificationMessage,
            link: `/employee/forms-view`
          });
        }
      }
    } catch (notificationError) {
      console.error("Error creating form updated notification:", notificationError);
    }

    // Trigger notification to assigned employees when form is published (additional notification for publishing)
    if ((originalForm.status !== 'PUBLISHED' && updated.status === 'PUBLISHED') ||
        (originalForm.status !== 'APPROVED' && updated.status === 'APPROVED')) {
      try {
        // Find all employees assigned to this plant
        const employees = await User.find({
          plantId: updated.plantId,
          role: "EMPLOYEE",
          isActive: true
        });

        for (const employee of employees) {
          await createNotification({
            userId: employee._id,
            title: "New Form Available",
            message: `${updated.formName} is now available`,
            link: `/employee/forms-view`
          });
        }
      } catch (notificationError) {
        console.error("Error creating form published notification:", notificationError);
      }
    }

    res.json({
      success: true,
      message: "Form updated successfully",
      updated
    });
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
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Invalidate cache for forms list
    try {
      const cacheKey = generateCacheKey('forms', { 
        page: 1, 
        limit: 10, 
        role: req.user.role,
        plantId: req.user.plantId 
      });
      await deleteFromCache(cacheKey);
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }
    
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
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Invalidate cache for forms list
    try {
      const cacheKey = generateCacheKey('forms', { 
        page: 1, 
        limit: 10, 
        role: req.user.role,
        plantId: req.user.plantId 
      });
      await deleteFromCache(cacheKey);
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }
    
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
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    
    // Only allow toggling if the form belongs to the same plant
    if (form.plantId.toString() !== req.user.plantId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this form" });
    }
    
    const updated = await Form.findByIdAndUpdate(
      req.params.id,
      { isTemplate },
      { new: true }
    );
    
    res.json({
      success: true,
      message: `Form ${isTemplate ? 'saved as' : 'removed from'} template successfully`,
      updated
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
    await Form.findByIdAndUpdate(req.params.id, {
      isActive: false
    });

    res.json({ message: "Form removed successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};
