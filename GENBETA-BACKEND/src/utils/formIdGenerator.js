import crypto from 'crypto';

/**
 * Generate form ID in slug format: new-template---24-jan-10:08-pm-mksj9upq
 * Format: [form-name-in-lowercase-with-dashes]---[day]-[month]-[hour]:[minute]-[am/pm]-[random-string]
 * @param {string} formName - The name of the form
 * @returns {string} Generated form ID
 */
export const generateFormId = (formName) => {
  // Convert form name to lowercase and replace spaces/special chars with dashes
  const sanitizedName = formName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  // Get current date/time
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[now.getMonth()];
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  
  // Generate random numeric suffix (6 digits)
  const randomNumeric = Math.floor(100000 + Math.random() * 900000);
  
  // Combine all parts
  return `${sanitizedName}---${day}-${month}-${displayHours}:${minutes}-${ampm}-${randomNumeric}`;
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
 * Format: formname-number
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