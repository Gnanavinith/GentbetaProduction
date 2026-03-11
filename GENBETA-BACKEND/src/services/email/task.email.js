import { sendEmail, getBaseLayout, resolveEmailSender } from "../email.service.js";

/**
 * Sends email notification to employee when a new form/task is assigned
 */
export const sendNewTaskAssignedEmail = async (
  to,
  employeeName,
  formName,
  assignedBy,
  assignedDate,
  dueDate,
  taskLink,
  company,
  plant
) => {
  const cleanFormName = formName || "a form";
  const assignerName = assignedBy || "Your Supervisor";
  const formattedDate = assignedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const dueDateText = dueDate
    ? `<p style="margin-top: 20px; font-size: 14px; color: #dc2626; font-weight: bold;">⏰ Due Date: ${dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })}</p>`
    : "";

  const content = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">New Form Assigned</h1>
      
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${employeeName},</p>
      
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        You have been assigned a new form to complete:
      </p>
      
      <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 18px; color: #1e293b; font-weight: bold;">📋 ${cleanFormName}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Assigned by: ${assignerName}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Assigned on: ${formattedDate}</p>
        ${dueDateText}
      </div>
      
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Please complete this form at your earliest convenience.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${taskLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">View My Assignments</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #64748b; line-height: 1.6;">
        If you have any questions or need assistance, please contact your supervisor or administrator.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8;">
          This is an automated notification from your organization's form management system.
        </p>
      </div>
    </div>
  `;

  const fromAddress = await resolveEmailSender({
    actor: null,
    companyId: company?._id,
    plantId: plant?._id,
    fallbackFrom: `"Matapang" <${process.env.EMAIL_USER || process.env.SMTP_FROM || 'no-reply@matapang.com'}>`
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `Action Required: New Form Assigned - ${cleanFormName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await sendEmail(mailOptions);
    return info;
  } catch (error) {
    console.error(`sendNewTaskAssignedEmail failed → TO: ${to} | FORM: ${cleanFormName}`, error.message);
    return { messageId: "mock-id", skipped: true };
  }
};