import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Company from "../models/Company.model.js";
import Plant from "../models/Plant.model.js";

dotenv.config();

/* ============================
   GLOBAL HELPERS
   ============================ */

const formatIST = (date) => {
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);
  
  // Validate date
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  // Format with timezone indicator for clarity
  const formattedDate = d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  
  return `${formattedDate} (IST)`;
};


const getBaseUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://login.matapangtech.com"
  );
};

// Helper function to format field values for email display
const formatFieldValue = (value, fieldType = "text") => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  
  // Handle arrays (checkbox, multiple select)
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.join(", ");
  }
  
  // Handle objects (file uploads, complex data)
  if (typeof value === "object") {
    // Auto-user object
    if (fieldType === "auto-user" && value.name) {
      const userFields = [];
      if (value.name) userFields.push(`Name: ${value.name}`);
      if (value.email) userFields.push(`Email: ${value.email}`);
      if (value.role) userFields.push(`Role: ${value.role}`);
      if (value.employeeID) userFields.push(`Employee ID: ${value.employeeID}`);
      if (value.department) userFields.push(`Department: ${value.department}`);
      if (value.phoneNumber) userFields.push(`Phone: ${value.phoneNumber}`);
      if (value.position) userFields.push(`Position: ${value.position}`);
      
      // Add any other fields that might be present
      Object.keys(value).forEach(key => {
        if (!["name", "email", "role", "employeeID", "department", "phoneNumber", "position", "id"].includes(key)) {
          userFields.push(`${key}: ${value[key]}`);
        }
      });
      
      return userFields.join(" | ");
    }
    
    // File upload object
    if (value.url && value.originalName) {
      return `${value.originalName} (${value.url})`;
    }
    
    // Generic object - convert to JSON string for display
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return "[Complex Data]";
    }
  }

  // Handle dates – use formatIST for consistency
  if (fieldType === "date" && typeof value === "string") {
    return formatIST(value);
  }

  // Handle numbers
  if (fieldType === "number" && typeof value === "number") {
    return value.toString();
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Default: convert to string
  return String(value);
};

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Resolve the appropriate sender email based on context
 * Implements hierarchical email sending: Super Admin → Company → Plant → Employee
 */
const resolveEmailSender = async ({ actor, companyId, plantId, fallbackFrom = '"Matapang" <no-reply@matapang.com>' }) => {
  try {
    // Super Admin level - use platform identity
    if (actor === "SUPER_ADMIN") {
      return process.env.PLATFORM_EMAIL || '"Matapang Platform" <no-reply@matapang.com>';
    }

    // Company Admin level - use company email if available
    if (actor === "COMPANY_ADMIN" && companyId) {
      const company = await Company.findById(companyId).select("email name");
      if (company && company.email) {
        return `"${company.name} Admin" <${company.email}>`;
      }
    }

    // Plant Admin level - use plant email, fallback to company email
    if ((actor === "PLANT_ADMIN" || actor === "EMPLOYEE") && plantId) {
      const plant = await Plant.findById(plantId).populate("companyId", "email name").select("email name");
      if (plant) {
        // Prefer plant-specific email, then company email, then fallback
        const fromEmail = plant.email || plant.companyId?.email || process.env.PLATFORM_EMAIL || "no-reply@matapang.com";
        const fromName = plant.name || plant.companyId?.name || "Matapang";
        return `"${fromName}" <${fromEmail}>`;
      }
    }

    // Fallback to default
    return fallbackFrom;
  } catch (error) {
    console.error("Error resolving email sender:", error);
    return fallbackFrom;
  }
};

/**
 * Generates a base layout for emails with company and plant details.
 * Optionally includes a login button.
 */
const getBaseLayout = (content, company = {}, plant = {}, showLoginButton = false) => {
  const logoHtml = company.logoUrl
    ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 60px; margin-bottom: 20px;">`
    : `<h1 style="color: #4f46e5; margin: 0;">${company.name || 'Matapang'}</h1>`;

  const plantInfoHtml = (plant && plant.name)
    ? `<div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
         <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Plant:</strong> ${plant.name} ${plant.plantNumber ? `(\${plant.plantNumber})` : ''}</p>
         ${plant.location ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Location:</strong> ${plant.location}</p>` : ''}
       </div>`
    : '';

  const companyFooterHtml = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 2px 0;"><strong>${company.name || 'Matapang'}</strong></p>
      ${company.address ? `<p style="margin: 2px 0;">${company.address}</p>` : ''}
      ${company.gstNumber ? `<p style="margin: 2px 0;">GST: ${company.gstNumber}</p>` : ''}
    </div>
  `;

  const loginButtonHtml = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="https://login.matapangtech.com/login" 
         style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        Go to Login
      </a>
    </div>
  `;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; color: #334155;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${logoHtml}
      </div>
      ${plantInfoHtml}
      ${content}
      ${showLoginButton ? loginButtonHtml : ""}
      ${companyFooterHtml}
      <p style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  `;
};

// Function to detect and remove duplication in formName
const removeDuplication = (name) => {
  // Split the name by common separators and check for repetition
  const parts = name.split(/[-_]/);
  
  // Check if we have a pattern like "w-w-234213" (same part repeated)
  if (parts.length >= 3) {
    // Check for immediate duplication like "w-w" followed by ID
    if (parts[0] === parts[1]) {
      // This is duplication like "w-w-234213", return first part only
      return parts[0];
    }
    // Check for other positions of duplication
    for (let i = 0; i < parts.length - 1; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        if (parts[i] === parts[j]) {
          // Found duplication, return the unique part
          return parts[i];
        }
      }
    }
  } else if (parts.length === 2 && parts[0] === parts[1]) {
    // Handle case like "w-w" with no ID
    return parts[0];
  }
  
  // For other cases, return the name as is
  return name;
};

// Export the global helpers that were previously shared
export {
  formatIST,
  getBaseUrl,
  formatFieldValue,
  transporter,
  resolveEmailSender,
  getBaseLayout,
  removeDuplication
};
