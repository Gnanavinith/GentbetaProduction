import { isCompanyOverLimit, validateFacilityCreation } from "../utils/planLimits.js";

/**
 * Middleware to check if company is over plan limits
 * Does NOT block operations, but adds overLimit status to request
 */
export const checkPlanLimits = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId;
    
    if (!companyId) {
      return next();
    }

    const overLimitStatus = await isCompanyOverLimit(companyId);
    
    // Attach over limit status to request for use in controllers
    req.overLimitStatus = overLimitStatus;
    
    next();
  } catch (error) {
    console.error("Plan limit check error:", error);
    // Don't block operations on error - fail gracefully
    next();
  }
};

/**
 * Middleware to enforce plan limits for resource creation
 * Blocks creation when over limit
 */
export const enforcePlanLimits = (resourceType) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId || req.body.companyId;
      
      if (!companyId) {
        return res.status(400).json({ 
          success: false, 
          message: "Company ID required" 
        });
      }

      // For form creation, we need to check plant-specific limits
      if (resourceType === "form") {
        const plantId = req.user?.plantId || req.body.plantId;
        
        if (!plantId) {
          return res.status(400).json({ 
            success: false, 
            message: "Plant ID required for form creation" 
          });
        }
        
        const validationResult = await validateFacilityCreation(companyId, plantId);
        
        if (!validationResult.allowed) {
          return res.status(403).json({
            success: false,
            message: validationResult.message,
            overLimit: true,
            upgradeRequired: validationResult.upgradeRequired,
            currentCount: validationResult.currentCount,
            limit: validationResult.limit
          });
        }
        
        return next();
      }
      
      // For other resources, use company-wide limits
      const overLimitStatus = await isCompanyOverLimit(companyId);
      
      // If not over limit, allow operation
      if (!overLimitStatus.overLimit) {
        return next();
      }

      // Check specific resource type limits
      let isBlocked = false;
      let message = "";
      
      switch (resourceType) {
        case "plant":
          if (overLimitStatus.isOverPlantLimit) {
            isBlocked = true;
            message = `Plan limit exceeded: You have ${overLimitStatus.usage.plants} plants but your ${overLimitStatus.planId} plan allows only ${overLimitStatus.limits.maxPlants}. Please upgrade to add more plants.`;
          }
          break;
          
        case "employee":
          if (overLimitStatus.isOverEmployeeLimit) {
            isBlocked = true;
            message = `Plan limit exceeded: You have ${overLimitStatus.usage.employees} employees but your ${overLimitStatus.planId} plan allows only ${overLimitStatus.limits.maxEmployeesPerPlant} employees. Please upgrade to add more employees.`;
          }
          break;
          
        default:
          // For general operations, only block if severely over limit
          if (overLimitStatus.overLimit) {
            isBlocked = true;
            message = `Plan limit exceeded. Please upgrade your subscription to continue.`;
          }
      }

      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message,
          overLimit: true,
          overLimitDetails: overLimitStatus
        });
      }

      next();
    } catch (error) {
      console.error("Plan enforcement error:", error);
      // Fail gracefully - don't block on error
      next();
    }
  };
};

/**
 * Middleware to add over-limit warning to response
 */
export const addOverLimitWarning = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only add warning for successful responses
    if (data && data.success !== false && req.overLimitStatus?.overLimit) {
      data.overLimitWarning = {
        message: "Your company is currently over plan limits. Some features may be restricted.",
        details: req.overLimitStatus
      };
    }
    return originalJson.call(this, data);
  };
  
  next();
};