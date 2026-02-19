import crypto from 'crypto';

/**
 * Generate form ID in simple format: efsdf-523006
 * Facilityat: [random-string]-[timestamp-based-number]
 * @param {string} formName - The name of the form
 * @returns {string} Generated form ID
 */
export const generateFacilityId = (formName) => {
  // Generate a random short string based on form name if available
  let baseString = 'form';
  
  if (formName) {
    // Take first few letters of form name (convert to lowercase, keep only alphanumeric)
    baseString = formName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 5) || 'form';
  }
  
  // Generate timestamp-based number
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  
  return `${baseString}-${randomNum}`;
};

/**
 * Generate a simple random suffix for form IDs
 * @returns {string} 6-digit random number string
 */
export const generateRandomSuffix = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a readable submission ID combining form name and numerical ID
 * Facilityat: formname-number
 * @param {string} formName - Name of the form
 * @param {number} numericalId - Numerical ID of the submission
 * @returns {string} Readable submission ID
 */
export const generateReadableSubmissionId = (formName, numericalId) => {
  if (!formName || !numericalId) {
    return numericalId || '';
  }
  
  // Sanitize form name to create a clean identifier
  const sanitizedName = formName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 20); // Limit length to 20 characters
  
  return `${sanitizedName}-${numericalId}`;
};