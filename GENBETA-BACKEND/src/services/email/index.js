// Export all email functions from the modular files
export * from './approval.email.js';
export * from './notification.email.js';
export * from './general.email.js';

// Export the global helpers as well for use in the individual modules
export {
  formatIST,
  getBaseUrl,
  formatFieldValue,
  transporter,
  resolveEmailSender,
  getBaseLayout
} from '../email.service.js';