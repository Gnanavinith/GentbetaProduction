import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";
import User from "../models/User.model.js";
import FormTemplate from "../models/FormTemplate.model.js";
import { getPlanLimits, isUnlimited, checkLimit, getPlanById } from "../config/plans.js";

import Form from "../models/Form.model.js";

export const getCompanyUsage = async (companyId) => {
  const [plantsCount, formTemplatesCount, formsCount, employeesCount] = await Promise.all([
    Plant.countDocuments({ companyId, isActive: true }),
    FormTemplate.countDocuments({ companyId, isActive: true }),
    Form.countDocuments({ companyId, isActive: true }),
    User.countDocuments({ companyId, role: "EMPLOYEE", isActive: true }),
  ]);

  return {
    plants: plantsCount,
    forms: formTemplatesCount + formsCount, // Total forms across both models
    employees: employeesCount,
  };
};

export const getPlantUsage = async (plantId) => {
  const [formTemplatesCount, formsCount, employeesCount] = await Promise.all([
    FormTemplate.countDocuments({ plantId, isActive: true }),
    Form.countDocuments({ plantId, isActive: true }),
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

export const validateFormCreation = async (companyId, plantId) => {
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
  const [formTemplatesCount, formsCount] = await Promise.all([
    FormTemplate.countDocuments({ plantId, isActive: true }),
    Form.countDocuments({ plantId, isActive: true })
  ]);
  const currentForms = formTemplatesCount + formsCount;

  if (!checkLimit(currentForms, limits.maxFormsPerPlant)) {
    const plan = getPlanById(planId);
    return {
      allowed: false,
      message: `Form limit reached. Your ${plan.name} plan allows only ${limits.maxFormsPerPlant} forms per plant. Please upgrade to add more forms.`,
      upgradeRequired: true,
      currentCount: currentForms,
      limit: limits.maxFormsPerPlant,
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
  const isOverFormLimit = !isUnlimited(limits.maxFormsPerPlant) && usage.forms > limits.maxFormsPerPlant;
  const isOverEmployeeLimit = !isUnlimited(limits.maxEmployeesPerPlant) && usage.employees > limits.maxEmployeesPerPlant;

  return {
    overLimit: isOverPlantLimit || isOverFormLimit || isOverEmployeeLimit,
    isOverPlantLimit,
    isOverFormLimit,
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
        formsLimit: isUnlimited(limits.maxFormsPerPlant) ? "Unlimited" : limits.maxFormsPerPlant,
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
      maxFormsPerPlant: isUnlimited(limits.maxFormsPerPlant) ? "Unlimited" : limits.maxFormsPerPlant,
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
