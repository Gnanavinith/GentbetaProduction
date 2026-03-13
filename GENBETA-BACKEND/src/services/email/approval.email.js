import { 
  formatIST,
  formatFieldValue, 
  sendEmail,
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
  const cleanFormName = removeDuplication(formName);
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">Facility Approval Request</h2>
    <p>You have been requested to fill out and approve the following form:</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${cleanFormName}</strong>
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
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendApprovalEmail failed → TO: ${to} | FORM: ${cleanFormName}`, error.message);
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
  submitterEmail = null,
  formCode = ""
) => {
  const cleanFormName = removeDuplication(formName);
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";
  const displayFormCode = formCode || formId || 'FORM';

  // ── Previous approvals section ───────────────────────────────────────────
  let approvalContext = "";
  if (previousApprovals.length > 0) {
    const approvalDetails = previousApprovals.map(approval => {
      const statusColor = approval.status?.toLowerCase() === 'rejected' ? '#ef4444' : '#10b981';
      const statusIcon = approval.status?.toLowerCase() === 'rejected' ? '❌' : '✅';
      return `
        <div style="background-color: #f0fdf4; border-left: 3px solid ${statusColor}; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <strong style="color: #1f2937; font-size: 14px;">${statusIcon} ${approval.name}</strong>
            <span style="color: ${statusColor}; font-weight: bold; font-size: 12px;">${approval.status || 'APPROVED'}</span>
          </div>
          <div style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">
            ${approval.date ? new Date(approval.date).toLocaleString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true
            }).replace(',', '') : 'Unknown date'}
          </div>
          ${approval.comments ? `<div style="color: #4b5563; font-size: 13px; font-style: italic; background-color: #fef3c7; padding: 8px; border-radius: 3px; margin-top: 5px;">"${approval.comments}"</div>` : ''}
        </div>
      `;
    }).join('');

    approvalContext = `
      <div style="margin: 20px 0;">
        <h4 style="color: #374151; margin-bottom: 15px; font-size: 14px;">Previous Approvals:</h4>
        ${approvalDetails}
        <p style="color: #4b5563; font-size: 14px; background-color: #eff6ff; padding: 10px; border-radius: 4px; margin-top: 15px;">
          <strong>⏳ Waiting for your approval</strong>
        </p>
      </div>
    `;
  }

  // ── Selected field summary ────────────────────────────────────────────────
  const approvalFields = formFields.filter(field => field.includeInApprovalEmail);
  let approvalSummaryHtml = '';

  if (approvalFields.length > 0) {
    const summaryRows = approvalFields.map(field => {
      const fieldValue =
        submissionData[field.id] ||
        submissionData[field.fieldId] ||
        submissionData[field.label?.toLowerCase().replace(/\s+/g, '_')] ||
        submissionData[field.label?.toLowerCase().replace(/\s+/g, '-')] ||
        '—';

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">${field.label}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${formatFieldValue(fieldValue, field.type)}</td>
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

  const fromAddress = await resolveEmailSender({
    actor,
    companyId,
    plantId,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Facility Submitted] ${displayFormCode} | Submitted by ${submitterName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendSubmissionNotificationToApprover failed → TO: ${to} | FORM: ${cleanFormName}`, error.message);
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
  const cleanFormName = removeDuplication(formName);
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">New Form Awaiting Your Approval</h2>
    <p style="color: #1f2937; font-size: 16px;">
      <strong>${creatorName}</strong> has created a new form that requires your approval.
    </p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="font-size: 18px;">${cleanFormName}</strong>
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
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendFormCreatedApproverNotification failed → TO: ${to} | FORM: ${cleanFormName}`, error.message);
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends notification to GROUP members when they are assigned as approvers for a form
 */
export const sendGroupApproverFormNotification = async (
  to,
  memberName,
  formName,
  formId,
  groupName,
  creatorName,
  link,
  company = {},
  plant = {},
  actor = "PLANT_ADMIN",
  companyId = null,
  plantId = null
) => {
  const cleanFormName = removeDuplication(formName);
  const safeLink = "https://login.matapangtech.com/employee/approval/pending";

  const content = `
    <h2 style="color: #4f46e5;">You Are a Group Approver for a New Form</h2>
    <p style="color: #1f2937; font-size: 16px;">
      Hi <strong>${memberName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 15px;">
      <strong>${creatorName}</strong> has created a new form that requires approval from your group.
    </p>
    <div style="background-color: #eff6ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Form Name</p>
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${cleanFormName}</p>
    </div>
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 14px; color: #166534; font-weight: 600;">
        👥 Your Approval Group: ${groupName}
      </p>
      <p style="margin: 0; font-size: 13px; color: #15803d;">
        Any one member of <strong>${groupName}</strong> can approve submissions for this form.
        Once one member approves, the form moves to the next stage.
      </p>
    </div>
    <p style="color: #4b5563; font-size: 14px;">
      When an employee submits this form, you will receive another notification to review and approve it.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
        View Pending Approvals
      </a>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
      If you were not expecting this email, please contact your administrator.
    </p>
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
    subject: `[Group Approver Assigned] You are an approver for "${cleanFormName}" | Group: ${groupName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendGroupApproverFormNotification failed → TO: ${to} | GROUP: ${groupName}`, error.message);
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
  const cleanFormName = removeDuplication(formName);
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
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
        Status: <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
      </p>
      ${comments ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Comments: "${comments}"</p>` : ''}
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Submission</a>
    </div>
  `;

  const subject = isApproved
    ? `[Form Approved] ${submissionId || formId || 'FORM-ID'} | Level ${level} Approved by ${approverName}`
    : `[Form Rejected] ${submissionId || formId || 'FORM-ID'} | Level ${level} Rejected by ${approverName}`;

  const fromAddress = await resolveEmailSender({
    actor,
    companyId,
    plantId: plantIdParam || plantId,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendApprovalStatusNotificationToPlant failed → TO: ${to} | STATUS: ${status}`, error.message);
    return { messageId: "mock-id", skipped: true };
  }
};