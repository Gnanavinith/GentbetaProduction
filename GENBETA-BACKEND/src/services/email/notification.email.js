import { 
  formatIST, 
  getBaseUrl, 
  formatFieldValue, 
  transporter, 
  sendEmail,  // Added sendEmail function
  resolveEmailSender, 
  getBaseLayout,
  removeDuplication 
} from '../email.service.js';

/**
 * Sends notification to plant admins when a form is submitted
 */
export const sendSubmissionNotificationToPlant = async (
  to,
  formName,
  submitterName,
  submittedAt,
  link,
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  actor = "EMPLOYEE",
  companyId = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">New Form Submission</h2>
    <p style="color: #1f2937; font-size: 16px;">
      <strong>${submitterName}</strong> has submitted a form.
    </p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${cleanFormName}</strong>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Submitted at: ${formatIST(submittedAt)}</p>
    </div>
    <p>Click below to view the submission details.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Submission</a>
    </div>
  `;

  const fromAddress = await resolveEmailSender({
    actor,
    companyId,
    plantId,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Facility Submitted] ${submissionId || formId || 'FORM-ID'} | Submitted by ${submitterName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    console.log("Submission notification to plant sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Submission notification to plant failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends rejection notification to the submitter
 */
export const sendRejectionNotificationToSubmitter = async (
  to,
  formName,
  rejectorName,
  comments,
  link,
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  actor = "PLANT_ADMIN",
  companyId = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #ef4444;">Form Submission Rejected</h2>
    <p style="color: #1f2937; font-size: 16px;">
      Your submission for <strong>${cleanFormName}</strong> has been rejected by <strong>${rejectorName}</strong>.
    </p>
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="color: #991b1b;">Reason for Rejection:</strong>
      <p style="margin: 10px 0 0 0; color: #7f1d1d;">"${comments}"</p>
    </div>
    <p>Please review the feedback and make necessary corrections before resubmitting.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Submission</a>
    </div>
  `;

  const fromAddress = await resolveEmailSender({
    actor,
    companyId,
    plantId,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Form Rejected] ${submissionId || formId || 'FORM-ID'} | Rejected at Level 1`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    console.log("Rejection notification to submitter sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Rejection notification to submitter failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends final approval notification to the submitter
 */
export const sendFinalApprovalNotificationToSubmitter = async (
  to,
  formName,
  submittedAt,
  approvalHistory,
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  actor = "PLANT_ADMIN",
  companyId = null,
  plantIdParam = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  const historyHtml = approvalHistory.map(h => `
    <li style="margin-bottom: 10px;">
      <strong>${h.name}</strong> - Approved at ${formatIST(h.date)}
      ${h.comments ? `<br/><span style="color: #6b7280; font-style: italic;">"${h.comments}"</span>` : ''}
    </li>
  `).join('');

  const content = `
    <h2 style="color: #10b981;">Facility Fully Approved</h2>
    <p style="color: #1f2937; font-size: 16px;">
      Your submission for <strong>${cleanFormName}</strong> at ${formatIST(submittedAt)} has been fully verified and approved.
    </p>
    <div style="margin: 25px 0;">
      <h4 style="color: #374151; margin-bottom: 15px;">Approval History:</h4>
      <ul style="color: #4b5563; padding-left: 20px;">
        ${historyHtml}
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://login.matapangtech.com/plant/forms-view" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Summary</a>
    </div>
  `;

  const fromAddress = await resolveEmailSender({
    actor,
    companyId,
    plantId: plantIdParam,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Facility Fully Approved] ${submissionId || formId || 'FORM-ID'} | Final Approval Completed`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error("Final approval notification failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends final approval notification to plant admins
 */
export const sendFinalApprovalNotificationToPlant = async (
  to,
  formName,
  submittedAt,
  approvalHistory,
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  actor = "PLANT_ADMIN",
  companyId = null,
  plantIdParam = null,
  approverEmail = null,
  approverName = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  const historyHtml = approvalHistory.map(h => `
    <li style="margin-bottom: 10px;">
      <strong>${h.name}</strong> - Approved at ${formatIST(h.date)}
      ${h.comments ? `<br/><span style="color: #6b7280; font-style: italic;">"${h.comments}"</span>` : ''}
    </li>
  `).join('');

  const content = `
    <h2 style="color: #10b981;">Facility Fully Approved</h2>
    <p style="color: #1f2937; font-size: 16px;">
      The submission for <strong>${cleanFormName}</strong> at ${formatIST(submittedAt)} has been fully verified and approved.
    </p>
    <div style="margin: 25px 0;">
      <h4 style="color: #374151; margin-bottom: 15px;">Approval History:</h4>
      <ul style="color: #4b5563; padding-left: 20px;">
        ${historyHtml}
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://login.matapangtech.com/plant/forms-view" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Summary</a>
    </div>
  `;

  const fromAddress = approverEmail && approverName
    ? `"${approverName}" <${approverEmail}>`
    : await resolveEmailSender({
        actor,
        companyId,
        plantId: plantIdParam,
        fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
      });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Facility Fully Approved] ${submissionId || formId || 'FORM-ID'} | Final Approval Completed`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error("Final approval notification to plant failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};