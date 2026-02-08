/**
 * Centralized error handling utility
 * Provides consistent error logging and user feedback
 */

/**
 * Logs errors in development, silent in production
 * @param {string} context - Where the error occurred
 * @param {Error|object} error - The error object
 * @param {string} userMessage - Optional user-friendly message
 */
export const handleError = (context, error, userMessage = null) => {
  // Only log in development
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  
  // Return user-friendly error message
  return userMessage || 
         error?.response?.data?.message || 
         error?.message || 
         'An unexpected error occurred';
};

/**
 * Safe error logging for production
 */
export const logError = (context, error) => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, could send to error tracking service
};
