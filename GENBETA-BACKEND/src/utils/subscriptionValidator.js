/**
 * Dedicated subscription validator module
 * Checks form creation limits only - NOT submissions or approvals
 */

import Form from "../models/Form.model.js";
import FormTemplate from "../models/FormTemplate.model.js";
import { getPlanLimits, isUnlimited, checkLimit, getPlanById } from "../config/plans.js";
import Company from "../models/Company.model.js";
import FormSubmission from "../models/FormSubmission.model.js";
import ApprovalTask from "../models/ApprovalTask.model.js";
import Notification from "../models/Notification.model.js";
import Plant from "../models/Plant.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

/**
 * Validates if a plant can create a new form based on subscription limits
 * @param {string} plantId - The plant ID
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with allowed status and message
 */
export const checkFormCreationLimit = async (plantId, companyId) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return {
        allowed: false,
        message: "Company not found"
      };
    }

    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }

    // Count total forms for this plant (both Form and FormTemplate models)
    const [formTemplatesCount, formsCount] = await Promise.all([
      FormTemplate.countDocuments({ plantId, isActive: true }),
      Form.countDocuments({ plantId, isActive: true })
    ]);

    const totalForms = formTemplatesCount + formsCount;
    const maxFormsPerPlant = limits.maxFormsPerPlant;

    if (!checkLimit(totalForms, maxFormsPerPlant)) {
      const plan = getPlanById(planId);
      return {
        allowed: false,
        message: `Form creation limit reached (${maxFormsPerPlant}). Your ${plan.name} plan allows only ${maxFormsPerPlant} forms per plant. Please upgrade your plan.`,
        upgradeRequired: true,
        currentCount: totalForms,
        limit: maxFormsPerPlant
      };
    }

    return { 
      allowed: true 
    };
  } catch (error) {
    console.error("Error checking form creation limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
};

/**
 * Validates if a company can create a new plant based on subscription limits
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with allowed status and message
 */
export const checkPlantCreationLimit = async (companyId) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return {
        allowed: false,
        message: "Company not found"
      };
    }

    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }

    const totalPlants = await Plant.countDocuments({ companyId, isActive: true });
    const maxPlants = limits.maxPlants;

    if (!checkLimit(totalPlants, maxPlants)) {
      const plan = getPlanById(planId);
      return {
        allowed: false,
        message: `Plant creation limit reached (${maxPlants}). Your ${plan.name} plan allows only ${maxPlants} plants. Please upgrade your plan.`,
        upgradeRequired: true,
        currentCount: totalPlants,
        limit: maxPlants
      };
    }

    return { 
      allowed: true 
    };
  } catch (error) {
    console.error("Error checking plant creation limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
};

/**
 * Validates if a plant can add a new employee based on subscription limits
 * @param {string} plantId - The plant ID
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with allowed status and message
 */
export const checkEmployeeCreationLimit = async (plantId, companyId) => {
  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return {
        allowed: false,
        message: "Company not found"
      };
    }

    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }

    const totalEmployees = await User.countDocuments({ 
      plantId, 
      role: "EMPLOYEE", 
      isActive: true 
    });
    const maxEmployeesPerPlant = limits.maxEmployeesPerPlant;

    if (!checkLimit(totalEmployees, maxEmployeesPerPlant)) {
      const plan = getPlanById(planId);
      return {
        allowed: false,
        message: `Employee creation limit reached (${maxEmployeesPerPlant}). Your ${plan.name} plan allows only ${maxEmployeesPerPlant} employees per plant. Please upgrade your plan.`,
        upgradeRequired: true,
        currentCount: totalEmployees,
        limit: maxEmployeesPerPlant
      };
    }

    return { 
      allowed: true 
    };
  } catch (error) {
    console.error("Error checking employee creation limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
}

/**
 * Validates if a user can submit a form based on monthly limits
 * @param {string} userId - The user ID
 * @param {string} plantId - The plant ID
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with submission limit check
 */
export const checkSubmissionLimit = async (userId, plantId, companyId) => {
  try {
    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Count submissions for this plant in current month
    const submissionCount = await FormSubmission.countDocuments({
      plantId,
      createdAt: { $gte: startOfMonth }
    });
    
    // Get company to check plan
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }
    
    // Check if submissions are unlimited
    if (isUnlimited(limits.maxSubmissionsPerMonth)) {
      return { 
        allowed: true,
        message: "Submissions are unlimited for this plan",
        currentCount: submissionCount,
        limit: limits.maxSubmissionsPerMonth
      };
    }
    
    // Check if limit is reached
    if (submissionCount >= limits.maxSubmissionsPerMonth) {
      const plan = getPlanById(planId);
      return { 
        allowed: false,
        message: `Monthly submission limit reached. Your ${plan.name} plan allows ${limits.maxSubmissionsPerMonth} submissions per month.`,
        currentCount: submissionCount,
        limit: limits.maxSubmissionsPerMonth,
        upgradeRequired: true
      };
    }
    
    return { 
      allowed: true,
      message: `Submissions within limit: ${submissionCount}/${limits.maxSubmissionsPerMonth}`,
      currentCount: submissionCount,
      limit: limits.maxSubmissionsPerMonth
    };
  } catch (error) {
    console.error("Error checking submission limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
};

/**
 * Validates if a user can approve a submission based on monthly limits
 * @param {string} userId - The user ID
 * @param {string} plantId - The plant ID
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with approval limit check
 */
export const checkApprovalLimit = async (userId, plantId, companyId) => {
  try {
    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Count approvals for this plant in current month
    const approvalCount = await ApprovalTask.countDocuments({
      plantId,
      status: { $in: ['APPROVED', 'REJECTED'] }, // Count completed approvals
      updatedAt: { $gte: startOfMonth }
    });
    
    // Get company to check plan
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }
    
    // Check if approvals are unlimited
    if (isUnlimited(limits.maxApprovalsPerMonth)) {
      return { 
        allowed: true,
        message: "Approvals are unlimited for this plan",
        currentCount: approvalCount,
        limit: limits.maxApprovalsPerMonth
      };
    }
    
    // Check if limit is reached
    if (approvalCount >= limits.maxApprovalsPerMonth) {
      const plan = getPlanById(planId);
      return { 
        allowed: false,
        message: `Monthly approval limit reached. Your ${plan.name} plan allows ${limits.maxApprovalsPerMonth} approvals per month.`,
        currentCount: approvalCount,
        limit: limits.maxApprovalsPerMonth,
        upgradeRequired: true
      };
    }
    
    return { 
      allowed: true,
      message: `Approvals within limit: ${approvalCount}/${limits.maxApprovalsPerMonth}`,
      currentCount: approvalCount,
      limit: limits.maxApprovalsPerMonth
    };
  } catch (error) {
    console.error("Error checking approval limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
};

/**
 * Validates if notifications can be sent based on monthly limits
 * @param {string} plantId - The plant ID
 * @param {string} companyId - The company ID
 * @returns {Object} Validation result with notification limit check
 */
export const checkNotificationLimit = async (plantId, companyId) => {
  try {
    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Count notifications for this plant in current month
    const notificationCount = await Notification.countDocuments({
      plantId,
      createdAt: { $gte: startOfMonth }
    });
    
    // Get company to check plan
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    const planId = company.subscription?.plan || "SILVER";
    let limits;
    if (planId === "CUSTOM" && company.subscription?.customLimits) {
      limits = company.subscription.customLimits;
    } else {
      limits = getPlanLimits(planId);
    }
    
    // Notifications are unlimited for all plans - they're critical for user experience
    return { 
      allowed: true,
      message: "Notifications are unlimited for all plans",
      currentCount: 0,
      limit: limits.maxNotificationsPerMonth
    };
  } catch (error) {
    console.error("Error checking notification limit:", error);
    // Fail gracefully - don't block operations on error
    return { 
      allowed: true 
    };
  }
};

