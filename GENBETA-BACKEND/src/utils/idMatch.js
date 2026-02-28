/**
 * Helper function to safely compare IDs regardless of whether they're
 * populated Mongoose objects, ObjectId instances, or strings
 * 
 * @param {any} a - First ID (can be string, ObjectId, or populated object)
 * @param {any} b - Second ID (can be string, ObjectId, or populated object)
 * @returns {boolean} - True if IDs match, false otherwise
 */
export const sameId = (a, b) => {
  // Handle null/undefined cases
  if (!a && !b) return true;
  if (!a || !b) return false;
  
  // Extract the actual ID value from either:
  // 1. A populated object: { _id: ObjectId, name: "..." }
  // 2. An ObjectId instance: ObjectId("...")
  // 3. A plain string: "6979a623b42aa6e9248ff314"
  const extractId = (value) => {
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (value.toString && typeof value.toString === 'function') return value.toString();
    return null;
  };
  
  const idA = extractId(a);
  const idB = extractId(b);
  
  return idA === idB;
};

/**
 * Helper function specifically for plant ID comparisons
 * @param {any} submissionPlantId - Plant ID from submission (populated or raw)
 * @param {any} userPlantId - Plant ID from user (usually string from JWT)
 * @returns {boolean} - True if plant IDs match
 */
export const samePlantId = (submissionPlantId, userPlantId) => {
  return sameId(submissionPlantId, userPlantId);
};

/**
 * Helper function specifically for company ID comparisons
 * @param {any} submissionCompanyId - Company ID from submission (populated or raw)
 * @param {any} userCompanyId - Company ID from user (usually string from JWT)
 * @returns {boolean} - True if company IDs match
 */
export const sameCompanyId = (submissionCompanyId, userCompanyId) => {
  return sameId(submissionCompanyId, userCompanyId);
};