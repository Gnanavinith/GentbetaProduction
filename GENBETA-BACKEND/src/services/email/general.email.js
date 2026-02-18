import { 
  formatIST, 
  getBaseUrl, 
  formatFieldValue, 
  transporter, 
  resolveEmailSender, 
  getBaseLayout 
} from '../email.service.js';

/**
 * Sends a welcome email to new users
 */
export const sendWelcomeEmail = async (
  to,
  name,
  role,
  companyName,
  loginUrl,
  password,
  company = {},
  plant = {},
  actor = "SYSTEM",
  companyId = null,
  plantId = null
) => {
  if (!loginUrl) {
    throw new Error("Login URL is missing");
  }

  const safeLoginUrl = loginUrl.startsWith("http")
    ? loginUrl
    : `${getBaseUrl()}${loginUrl}`;

  let roleLabel = "";
  switch (role) {
    case "COMPANY_ADMIN":
      roleLabel = "Company Administrator";
      break;
    case "PLANT_ADMIN":
      roleLabel = "Plant Administrator";
      break;
    case "EMPLOYEE":
      roleLabel = "Employee";
      break;
    default:
      roleLabel = "User";
  }

  const content = `
    <h2 style="color: #1f2937;">Hello ${name}!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Your account has been successfully created as an <strong>${roleLabel}</strong> for <strong>${companyName}</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; color: white;">
      <h3 style="margin: 0 0 15px 0; color: white;">Your Login Credentials</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
      <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
      <p style="margin-top: 15px; font-size: 12px; opacity: 0.9;">Please change your password after first login for security.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeLoginUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login to Your Account</a>
    </div>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <h4 style="color: #374151; margin: 0 0 10px 0;">What you can do:</h4>
      <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
        ${role === "COMPANY_ADMIN" ? `
          <li>Manage multiple plants</li>
          <li>Create and assign forms</li>
          <li>View company-wide analytics</li>
          <li>Manage plant administrators</li>
        ` : role === "PLANT_ADMIN" ? `
          <li>Manage your plant operations</li>
          <li>Create and publish forms</li>
          <li>Track form submissions</li>
          <li>Manage employees</li>
        ` : `
          <li>View assigned forms</li>
          <li>Submit form responses</li>
          <li>Track your submissions</li>
          <li>Access plant resources</li>
        `}
      </ul>
    </div>
    
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
      If you did not expect this email, please contact your system administrator.
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
    subject: `Welcome to ${companyName} - Your Account Has Been Created`,
    // Show login button only in welcome email
    html: getBaseLayout(content, company, plant, true)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to %s: %s", to, info.messageId);
    return info;
  } catch (error) {
    console.error("Welcome email sending failed, logging to console instead:");
    console.log("-----------------------------------------");
    console.log(`TO: ${to}`);
    console.log(`NAME: ${name}`);
    console.log(`ROLE: ${roleLabel}`);
    console.log(`COMPANY: ${companyName}`);
    console.log(`PASSWORD: ${password}`);
    console.log(`LOGIN URL: ${loginUrl}`);
    console.log("-----------------------------------------");
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends notification when a new plant is created
 */
export const sendPlantCreatedEmail = async (
  to,
  plantName,
  plantCode,
  companyName,
  company = {},
  plant = {},
  actor = "COMPANY_ADMIN",
  companyId = null,
  plantId = null
) => {
  const content = `
    <h1 style="color: #4f46e5; margin: 0 0 20px 0; text-align: center;">New Plant Created</h1>
    
    <p style="color: #4b5563; line-height: 1.6;">
      A new plant has been successfully created for <strong>${companyName}</strong>.
    </p>
    
    <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #065f46; margin: 0 0 15px 0;">Plant Details</h3>
      <p style="margin: 5px 0; color: #047857;"><strong>Plant Name:</strong> ${plantName}</p>
      <p style="margin: 5px 0; color: #047857;"><strong>Plant Code:</strong> ${plantCode}</p>
      ${plant.plantNumber ? `<p style="margin: 5px 0; color: #047857;"><strong>Plant Number:</strong> ${plant.plantNumber}</p>` : ''}
      ${plant.location ? `<p style="margin: 5px 0; color: #047857;"><strong>Location:</strong> ${plant.location}</p>` : ''}
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      You can now start managing this plant from your dashboard.
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
    subject: `New Plant Created - ${plantName}`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Plant created email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Plant created email failed, logging to console instead:");
    console.log("-----------------------------------------");
    console.log(`TO: ${to}`);
    console.log(`PLANT: ${plantName} (${plantCode})`);
    console.log(`COMPANY: ${companyName}`);
    console.log("-----------------------------------------");
    return { messageId: "mock-id", skipped: true };
  }
};

/**
 * Sends notification when a user profile is updated
 */
export const sendProfileUpdateNotification = async (
  to,
  employeeName,
  updatedFields,
  updatedBy,
  company = {},
  plant = {},
  actor = "COMPANY_ADMIN",
  companyId = null,
  plantId = null
) => {
  const fieldsHtml = Object.entries(updatedFields)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `<li style="margin: 5px 0;"><strong>${key}:</strong> ${value}</li>`)
    .join('');

  const content = `
    <h2 style="color: #4f46e5;">Profile Updated</h2>
    <p style="color: #1f2937; font-size: 16px;">
      Hello <strong>${employeeName}</strong>, your profile has been updated${updatedBy ? ` by <strong>${updatedBy}</strong>` : ''}.
    </p>
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong style="color: #166534;">Updated Information:</strong>
      <ul style="margin: 10px 0 0 0; color: #15803d; padding-left: 20px;">
        ${fieldsHtml}
      </ul>
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      If you did not expect these changes, please contact your administrator immediately.
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
    subject: `Your Profile Has Been Updated`,
    html: getBaseLayout(content, company, plant)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Profile update notification sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Profile update notification failed:", error);
    return { messageId: "mock-id", skipped: true };
  }
};