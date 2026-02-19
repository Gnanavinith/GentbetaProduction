import { 
  formatIST, 
  getBaseUrl, 
  formatFieldValue, 
  transporter, 
  resolveEmailSender, 
  getBaseLayout,
  removeDuplication 
} from '../email.service.js';

/**
 * Sends an approval email to designated approvers
 */
export const sendApprovalEmail = async (
  to,
  formName,
  link,
  company = {},
  plant = {},
  actor = "PLANT_ADMIN",
  companyId = null,
  plantId = null,
  formId = ""
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">Facility Approval Request</h2>
    <p>You have been requested to fill out and approve the following form:</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${formName}</strong>
    </div>
    <p>Please click the button below to open the form and submit your data. This link will expire in 48 hours.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Open Approval Form</a>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If you were not expecting this email, please ignore it.</p>
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
    subject: `[Approval Required] ${formId || 'FORM-ID'} – ${cleanFormName} | Level 1 Approval`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed, logging to console instead:");
    console.log("-----------------------------------------");
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${mailOptions.subject}`);
    console.log(`LINK: ${link}`);
    console.log("-----------------------------------------");
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends notification to approvers when a form submission is made
 */
export const sendSubmissionNotificationToApprover = async (
  to,
  formName,
  submitterName,
  submittedAt,
  link,
  previousApprovals = [],
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  formFields = [],
  submissionData = {},
  actor = "PLANT_ADMIN",
  companyId = null,
  submitterEmail = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  let approvalContext = "";
  if (previousApprovals.length > 0) {
    const lastApproval = previousApprovals[previousApprovals.length - 1];
    approvalContext = `<p style="color: #4b5563; font-size: 14px; background-color: #eff6ff; padding: 10px; border-radius: 4px;">${lastApproval.name} has approved this form. Waiting for your approval.</p>`;
  }

  const approvalFields = formFields.filter(field => field.includeInApprovalEmail);

  let approvalSummaryHtml = '';
  if (approvalFields.length > 0) {
    const summaryRows = approvalFields.map(field => {
      const fieldValue = submissionData[field.id] ||
        submissionData[field.fieldId] ||
        submissionData[field.label?.toLowerCase().replace(/\s+/g, '_')] ||
        '—';

      const formattedValue = formatFieldValue(fieldValue, field.type);
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">${field.label}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${formattedValue}</td>
        </tr>
      `;
    }).join('');

    approvalSummaryHtml = `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; overflow: hidden;">
        <div style="background-color: #f3f4f6; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          <h4 style="margin: 0; color: #1f2937; font-size: 16px;">Selected Submission Details</h4>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          ${summaryRows}
        </table>
      </div>
    `;
  }

  const content = `
    <h2 style="color: #4f46e5;">Facility Approval Request</h2>
    <p style="color: #1f2937; font-size: 16px;">
      <strong>${submitterName}</strong> submitted the form <strong>${cleanFormName}</strong> at ${formatIST(submittedAt)}.
    </p>
    ${approvalContext}
    ${approvalSummaryHtml}
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${cleanFormName}</strong>
    </div>
    <p>Please click the button below to review and take action on this submission.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Submission</a>
    </div>
  `;

  const fromAddress = submitterEmail
    ? `"${submitterName}" <${submitterEmail}>`
    : await resolveEmailSender({
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
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Submission notification failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends notification to approvers when a new form is created and awaiting approval
 */
export const sendFormCreatedApproverNotification = async (
  to,
  formName,
  creatorName,
  link,
  company = {},
  plant = {},
  actor = "PLANT_ADMIN",
  companyId = null,
  plantId = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">New Form Awaiting Your Approval</h2>
    <p style="color: #1f2937; font-size: 16px;">
      <strong>${creatorName}</strong> has created a new form that requires your approval.
    </p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${formName}</strong>
    </div>
    <p>You have been assigned as an approver for this form. Please review and take action.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Form</a>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If you were not expecting this email, please contact your administrator.</p>
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
    subject: `Action Required: Form Approval - ${cleanFormName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Form created approver notification sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Form created approver notification failed, logging to console:");
    console.log("-----------------------------------------");
    console.log(`TO: ${to}`);
    console.log(`FORM: ${formName}`);
    console.log(`CREATOR: ${creatorName}`);
    console.log(`LINK: ${link}`);
    console.log("-----------------------------------------");
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends approval status notification to plant admins
 */
export const sendApprovalStatusNotificationToPlant = async (
  to,
  formName,
  submitterName,
  approverName,
  status,
  comments,
  link,
  company = {},
  plant = {},
  plantId = "",
  formId = "",
  submissionId = "",
  level = 1,
  actor = "PLANT_ADMIN",
  companyId = null,
  plantIdParam = null,
  approverEmail = null
) => {
  // Process formName to remove duplication
  const cleanFormName = removeDuplication(formName);
  // Override the link to always go to the pending approvals page
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const isApproved = status.toUpperCase() === "APPROVED";
  const statusColor = isApproved ? "#10b981" : "#ef4444";
  const statusText = isApproved ? "Approved" : "Rejected";

  const content = `
    <h2 style="color: ${statusColor};">Form ${statusText}</h2>
    <p style="color: #1f2937; font-size: 16px;">
      <strong>${approverName}</strong> has ${statusText.toLowerCase()} a submission from <strong>${submitterName}</strong>.
    </p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${cleanFormName}</strong>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Status: <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
      ${comments ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Comments: "${comments}"</p>` : ''}
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Submission</a>
    </div>
  `;

  const subject = isApproved
    ? `[Form Approved] ${submissionId || formId || 'FORM-ID'} | Level ${level} Approved by ${approverName}`
    : `[Form Rejected] ${submissionId || formId || 'FORM-ID'} | Level ${level} Rejected by ${approverName}`;

  const fromAddress = approverEmail
    ? `"${approverName}" <${approverEmail}>`
    : await resolveEmailSender({
        actor,
        companyId,
        plantId: plantIdParam || plantId,
        fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
      });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: subject,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Approval status notification to plant sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Approval status notification to plant failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};