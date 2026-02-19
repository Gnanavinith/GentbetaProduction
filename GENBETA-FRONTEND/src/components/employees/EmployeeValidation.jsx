export const validateEmployeeFacility = (formData) => {
  const errors = [];
  
  // Required field validations
  if (!formData.name?.trim()) {
    errors.push("Full name is required");
  }
  
  if (!formData.email?.trim()) {
    errors.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!formData.position?.trim()) {
    errors.push("Position is required");
  }
  
  if (!formData.password?.trim()) {
    errors.push("Password is required");
  } else if (formData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  // Phone number validation (optional but if provided, should be valid)
  if (formData.phoneNumber && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
    errors.push("Please enter a valid phone number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmployeeLimits = (usageInfo, plantId) => {
  if (!usageInfo?.plantUsage) return { isValid: true, message: "" };
  
  const currentPlant = usageInfo.plantUsage.find(p => p.plantId === plantId);
  if (!currentPlant) return { isValid: true, message: "" };
  
  const limit = currentPlant.employeesLimit;
  if (limit === "Unlimited") return { isValid: true, message: "" };
  
  const isLimitReached = currentPlant.employees >= limit;
  
  return {
    isValid: !isLimitReached,
    message: isLimitReached 
      ? "Employee limit reached. Please contact your administrator to upgrade your plan." 
      : "",
    currentCount: currentPlant.employees,
    limit: limit
  };
};