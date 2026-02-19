import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import User from "../models/User.model.js";
import FacilityTemplate from "../models/FormTemplate.model.js";
import { getPlanLimits, isUnlimited, checkLimit, getPlanById } from "../config/plans.js";

import Facility from "../models/Form.model.js";

export const getCompanyUsage = async (companyId) => {
  const [plantsCount, formTemplatesCount, formsCount, employeesCount] = await Promise.all([
    Plant.countDocuments({ companyId, isActive: true }),
    FacilityTemplate.countDocuments({ companyId, isActive: true }),
    Facility.countDocuments({ companyId, isActive: true }),
    User.countDocuments({ companyId, role: "EMPLOYEE", isActive: true }),
  ]);

  return {
    plants: plantsCount,
    forms: formTemplatesCount + formsCount, // Total forms across both models
    employees: employeesCount,
  };
};

export const getPlantUsage = async (plantId) => {
  const [FacilityTemplatesCount, formsCount, employeesCount] = await Promise.all([
    FacilityTemplate.countDocuments({ plantId, isActive: true }),
    Facility.countDocuments({ plantId, isActive: true }),
    User.countDocuments({ plantId, role: "EMPLOYEE", isActive: true }),
  ]);

  return {
    forms: formTemplatesCount + formsCount, // Total forms across both models
    employees: employeesCount,
  };
};

export const validatePlantCreation = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) {
    return { allowed: false, message: "Company not found" };
  }

  const planId = company.subscription?.plan || "SILVER";
  let limits;
  if (planId === "CUSTOM" && company.subscription?.customLimits) {
    limits = company.subscription.customLimits;
  } else {
    limits = getPlanLimits(planId);
  }
  const currentPlants = await Plant.countDocuments({ companyId, isActive: true });

  if (!checkLimit(currentPlants, limits.maxPlants)) {
    const plan = getPlanById(planId);
    return {
      allowed: false,
      message: `Plant limit reached. Your ${plan.name} plan allows only ${limits.maxPlants} plants. Please upgrade to add more plants.`,
      upgradeRequired: true,
      currentCount: currentPlants,
      limit: limits.maxPlants,
    };
  }

  return { allowed: true };
};

export const validateFacilityCreation = async (companyId, plantId) => {
  const company = await Company.findById(companyId);
  if (!company) {
    return { allowed: false, message: "Company not found" };
  }

  const planId = company.subscription?.plan || "SILVER";
  let limits;
  if (planId === "CUSTOM" && company.subscription?.customLimits) {
    limits = company.subscription.customLimits;
  } else {
    limits = getPlanLimits(planId);
  }
  const [FacilityTemplatesCount, formsCount] = await Promise.all([
    FacilityTemplate.countDocuments({ plantId, isActive: true }),
    Facility.countDocuments({ plantId, isActive: true })
  ]);
  const currentFacilitys = formTemplatesCount + formsCount;

  if (!checkLimit(currentFacilitys, limits.maxFacilitysPerPlant)) {
    const plan = getPlanById(planId);
    return {
      allowed: false,
      message: `Facility limit reached. Your ${plan.name} plan allows only ${limits.maxFacilitysPerPlant} forms per plant. Please upgrade to add more forms.`,
      upgradeRequired: true,
      currentCount: currentFacilitys,
      limit: limits.maxFacilitysPerPlant,
    };
  }

  return { allowed: true };
};

export const validateEmployeeCreation = async (companyId, plantId) => {
  const company = await Company.findById(companyId);
  if (!company) {
    return { allowed: false, message: "Company not found" };
  }

  const planId = company.subscription?.plan || "SILVER";
  let limits;
  if (planId === "CUSTOM" && company.subscription?.customLimits) {
    limits = company.subscription.customLimits;
  } else {
    limits = getPlanLimits(planId);
  }
  const currentEmployees = await User.countDocuments({ 
    plantId, 
    role: "EMPLOYEE", 
    isActive: true 
  });

  if (!checkLimit(currentEmployees, limits.maxEmployeesPerPlant)) {
    const plan = getPlanById(planId);
    return {
      allowed: false,
      message: `Employee limit reached. Your ${plan.name} plan allows only ${limits.maxEmployeesPerPlant} employees per plant. Please upgrade to add more employees.`,
      upgradeRequired: true,
      currentCount: currentEmployees,
      limit: limits.maxEmployeesPerPlant,
    };
  }

  return { allowed: true };
};

export const isCompanyOverLimit = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) return { overLimit: false };

  const planId = company.subscription?.plan || "SILVER";
  let limits;
  if (planId === "CUSTOM" && company.subscription?.customLimits) {
    limits = company.subscription.customLimits;
  } else {
    limits = getPlanLimits(planId);
  }

  const usage = await getCompanyUsage(companyId);
  
  const isOverPlantLimit = !isUnlimited(limits.maxPlants) && usage.plants > limits.maxPlants;
  const isOverFacilityLimit = !isUnlimited(limits.maxFacilitysPerPlant) && usage.forms > limits.maxFacilitysPerPlant;
  const isOverEmployeeLimit = !isUnlimited(limits.maxEmployeesPerPlant) && usage.employees > limits.maxEmployeesPerPlant;

  return {
    overLimit: isOverPlantLimit || isOverFacilityLimit || isOverEmployeeLimit,
    isOverPlantLimit,
    isOverFacilityLimit,
    isOverEmployeeLimit,
    usage,
    limits,
    planId
  };
};

export const getCompanySubscriptionDetails = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) return null;

  const planId = company.subscription?.plan || "SILVER";
  const plan = getPlanById(planId);
  let limits;
  if (planId === "CUSTOM" && company.subscription?.customLimits) {
    limits = company.subscription.customLimits;
  } else {
    limits = plan.limits;
  }
  const usage = await getCompanyUsage(companyId);

  const plants = await Plant.find({ companyId, isActive: true });
  const plantUsage = await Promise.all(
    plants.map(async (plant) => {
      const plantStats = await getPlantUsage(plant._id);
      return {
        plantId: plant._id,
        plantName: plant.name,
        forms: plantStats.forms,
        employees: plantStats.employees,
        formsLimit: isUnlimited(limits.maxFacilitysPerPlant) ? "Unlimited" : limits.maxFacilitysPerPlant,
        employeesLimit: isUnlimited(limits.maxEmployeesPerPlant) ? "Unlimited" : limits.maxEmployeesPerPlant,
      };
    })
  );

  // Check if company is over limit
  const overLimitStatus = await isCompanyOverLimit(companyId);

  return {
    plan: {
      id: planId,
      name: plan.name,
      description: plan.description,
      features: plan.displayFeatures,
    },
    subscription: company.subscription,
    limits: {
      maxPlants: isUnlimited(limits.maxPlants) ? "Unlimited" : limits.maxPlants,
      maxFacilitysPerPlant: isUnlimited(limits.maxFacilitysPerPlant) ? "Unlimited" : limits.maxFacilitysPerPlant,
      maxEmployeesPerPlant: isUnlimited(limits.maxEmployeesPerPlant) ? "Unlimited" : limits.maxEmployeesPerPlant,
      approvalLevels: isUnlimited(limits.approvalLevels) ? "Unlimited" : limits.approvalLevels,
    },
    usage: {
      plants: usage.plants,
      plantsLimit: isUnlimited(limits.maxPlants) ? "Unlimited" : limits.maxPlants,
      plantsRemaining: isUnlimited(limits.maxPlants) ? "Unlimited" : Math.max(0, limits.maxPlants - usage.plants),
    },
    plantUsage,
    isOverLimit: overLimitStatus.overLimit,
    overLimitDetails: overLimitStatus
  };
};
