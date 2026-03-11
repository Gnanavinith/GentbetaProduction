// Export all email functions from the modular files
export * from './approval.email.js';
export * from './notification.email.js';
export * from './general.email.js';
export * from './task.email.js';

// Export shared helpers for use in individual modules
export {
  formatIST,
  getBaseUrl,
  formatFieldValue,
  sendEmail,
  resolveEmailSender,
  getBaseLayout
} from '../email.service.js';