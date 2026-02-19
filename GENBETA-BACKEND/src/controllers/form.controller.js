import Facility from "../models/Form.model.js";
import FacilityTemplate from "../models/FormTemplate.model.js";
import FacilitySubmission from "../models/FormSubmission.model.js";
import Assignment from "../models/Assignment.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import { sendApprovalEmail, sendFacilityCreatedApproverNotification } from "../services/email/index.js";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache, warmCache, getCacheStats } from "../utils/cache.js";
import { generateFacilityId } from "../utils/formIdGenerator.js";

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
export const createFacility = async (req, res) => {
  try {
    const { formId: providedFacilityId, formName, fields, sections, approvalFlow, approvalLevels, description, status } = req.body;

    // Validate layout structure - prefer sections fields, fall back to root fields for legacy forms
    const allFieldsToValidate = (sections && sections.length > 0) 
      ? sections.flatMap(s => s.fields || [])
      : (fields || []);
    validateLayoutStructure(allFieldsToValidate);

    // Generate formId if not provided
    let finalFacilityId = providedFacilityId || generateFacilityId(formName);
    
    // Ensure the formId is unique
    if (!providedFacilityId) { // Only check uniqueness if we generated the ID
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!isUnique && attempts < maxAttempts) {
        try {
          const existingFacility = await Facility.findOne({ formId: finalFacilityId });
          if (!existingFacility) {
            isUnique = true;
          } else {
            // Generate a new ID with additional randomness
            finalFacilityId = generateFacilityId(formName + Date.now().toString());
            attempts++;
          }
        } catch (error) {
          console.error('Error checking formId uniqueness:', error);
          isUnique = true; // Proceed anyway to avoid blocking the creation
        }
      }
    } else {
      finalFacilityId = providedFacilityId; // Use the provided ID
    }

    // Map approvalLevels from frontend to approvalFlow for backend
    const finalApprovalFlow = (approvalLevels || approvalFlow || []).map((level, index) => ({
      level: index + 1,
      approverId: level.approverId,
      name: level.name || `Level ${index + 1}`,
      description: level.description || ""
    }));

    const form = await Facility.create({
      formId: finalFacilityId,
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
      console.log('Invalidating cache key in createFacility:', cacheKey);
      await deleteFromCache(cacheKey);
      console.log('Cache invalidated successfully in createFacility');
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }

    res.status(201).json({
      success: true,
      message: "Facility created successfully",
      form
    });

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
              await sendFacilityCreatedApproverNotification(
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
export const getFacilitys = async (req, res) => {
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
    const total = await Facility.countDocuments(filter);
    console.log(`Total forms matching filter: ${total}`);

    // Get paginated forms
    const forms = await Facility.find(filter)
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
          submissionCount = await FacilitySubmission.countDocuments({ formId: form._id });
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
export const getFacilityById = async (req, res) => {
  try {
    // First, try to find in Facility model
    let form = await Facility.findById(req.params.id).populate("approvalFlow.approverId", "name email");
    
    if (!form) {
      // If not found in Facility model, try FacilityTemplate model
      form = await FacilityTemplate.findById(req.params.id).populate("workflow.approverId", "name email");
    }
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Facility not found" });
    }
    
    // Log the number of fields to help debug
    console.log(`Facility ${req.params.id} has ${form.fields?.length || 0} top-level fields and ${form.sections?.length || 0} sections`);
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
export const updateFacility = async (req, res) => {
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
    const originalFacility = await Facility.findById(req.params.id);
    
    const updated = await Facility.findByIdAndUpdate(
      req.params.id,
      finalPayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Facility not found" });
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
      const isWorkflowUpdate = !originalFacility.approvalFlow || originalFacility.approvalFlow.length === 0 || 
                              JSON.stringify(originalFacility.approvalFlow) !== JSON.stringify(finalPayload.approvalFlow);
      
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
                await sendFacilityCreatedApproverNotification(
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

    res.json({
      success: true,
      message: "Facility updated successfully",
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
export const archiveFacility = async (req, res) => {
  try {
    const form = await Facility.findByIdAndUpdate(
      req.params.id,
      { status: "ARCHIVED", archivedAt: new Date() },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Facility not found" });
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
    
    res.json({ success: true, message: "Facility archived successfully", data: form });
  } catch (error) {
    console.error("Archive form error:", error);
    res.status(500).json({ success: false, message: "Archive failed" });
  }
};

/* ======================================================
   RESTORE FORM
====================================================== */
export const restoreFacility = async (req, res) => {
  try {
    const form = await Facility.findByIdAndUpdate(
      req.params.id,
      { status: "PUBLISHED", archivedAt: null },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ success: false, message: "Facility not found" });
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
    
    res.json({ success: true, message: "Facility restored successfully", data: form });
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
    
    const form = await Facility.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: "Facility not found" });
    }
    
    // Only allow toggling if the form belongs to the same plant
    if (form.plantId.toString() !== req.user.plantId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this form" });
    }
    
    const updated = await Facility.findByIdAndUpdate(
      req.params.id,
      { isTemplate },
      { new: true }
    );
    
    res.json({
      success: true,
      message: `Facility ${isTemplate ? 'saved as' : 'removed from'} template successfully`,
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
export const deleteFacility = async (req, res) => {
  try {
    await Facility.findByIdAndUpdate(req.params.id, {
      isActive: false
    });

    res.json({ message: "Facility removed successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};
