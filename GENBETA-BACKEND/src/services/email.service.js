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
  
  // Handle case where date is an object
  if (typeof date === 'object' && date !== null) {
    // If it's a Date object, use it directly
    if (date instanceof Date) {
      // Validate date
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      // If it's a valid Date object, continue processing
    } else {
      // If it's a plain object (like {}), return error message
      if (Object.keys(date).length === 0) {
        return "No Date Provided";
      }
      // If it's an object with properties, try to extract date-like properties
      const dateString = date.$date || date.date || date.createdAt || date.updatedAt || date.submittedAt || date.toString();
      if (dateString) {
        const extractedDate = new Date(dateString);
        if (!isNaN(extractedDate.getTime())) {
          date = extractedDate;
        } else {
          return "Invalid Date Format";
        }
      } else {
        return "Invalid Date Format";
      }
    }
  }
  
  // Ensure date is a Date object now
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

// Helper function to format grid/table data for email display
const formatGridDataForEmail = (gridData, fieldDefinition = null, maxRows = 5, maxCols = 8, submissionLink = "#") => {
  if (!gridData || typeof gridData !== 'object') return "—";
  
  const rows = Object.entries(gridData);
  if (rows.length === 0) return "No data provided";
  
  const totalRows = rows.length;
  const showLimitedView = totalRows > maxRows;
  
  // For very large tables (more than 10 rows and 10 columns), show a simple message instead
  const gridColumnKeys = [...new Set(rows.flatMap(([rowKey, rowData]) => 
    typeof rowData === 'object' && rowData !== null ? Object.keys(rowData) : []
  ))];
  
  if (totalRows > 10 && gridColumnKeys.length > 10) {
    return `<div style="padding: 15px; background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 6px; text-align: center; margin: 10px 0;">
      <p style="margin: 0; color: #92400e; font-weight: 500; font-size: 14px;">
        This table contains more than 10 rows and 10 columns.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #92400e;">
  Click below to review the full submission
</p>
    </div>`;
  }
  
  // Extract column information from field definition or data
  let columnLabels = {};
  let rowLabels = {};
  let allColumnKeys = [];
  let hiddenColumns = 0;
  
  // Try to get labels from field definition
  if (fieldDefinition) {
    // Get column labels
    if (fieldDefinition.columns && Array.isArray(fieldDefinition.columns)) {
      fieldDefinition.columns.forEach(col => {
        const colId = col.id || col.fieldId;
        if (colId) {
          columnLabels[colId] = col.label || col.question || colId;
        }
      });
    }
    
    // Get row labels
    if (fieldDefinition.items && Array.isArray(fieldDefinition.items)) {
      fieldDefinition.items.forEach(item => {
        const itemId = item.id || item.fieldId;
        if (itemId) {
          rowLabels[itemId] = item.label || item.question || item.title || itemId;
        }
      });
    }
  }
  
  // If no field definition, try to infer from data structure
  if (Object.keys(columnLabels).length === 0) {
    // Get all unique column keys from the data
    allColumnKeys = [...new Set(rows.flatMap(([rowKey, rowData]) => 
      typeof rowData === 'object' && rowData !== null ? Object.keys(rowData) : []
    ))];
    
    // Limit columns if needed
    const displayColumnKeys = showLimitedView ? allColumnKeys.slice(0, maxCols) : allColumnKeys;
    hiddenColumns = showLimitedView ? allColumnKeys.length - maxCols : 0;
    
    // Create clean column labels for display columns only
    displayColumnKeys.forEach((key, index) => {
      if (key.startsWith('col') && key.match(/^col-?\d+$/)) {
        // Extract numeric part from column keys like 'col1' or 'col-123'
        const match = key.match(/^col-?(\d+)$/);
        if (match) {
          columnLabels[key] = `Column ${match[1]}`;
        } else {
          columnLabels[key] = key.replace(/^col-?/, 'Column ').replace(/^[A-Z]/, letter => letter);
        }
      } else if (key.match(/^col-\d+-\d+$/)) {
        // Handle timestamp-like column IDs (e.g., col-1772108506186-0)
        // Use simple sequential numbering for these
        columnLabels[key] = `Column ${Object.keys(columnLabels).filter(k => k.match(/^col-\d+-\d+$/)).length + 3}`;
      } else {
        columnLabels[key] = key.replace(/^col-?/, '').replace(/^[a-z]/, letter => letter.toUpperCase()).replace(/([A-Z])/g, ' $1').trim();
      }
    });
  }
  
  // Start building HTML table
  let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; background-color: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;">';
  
  // Table header
  html += '<thead><tr style="background-color: #f1f5f9;">';
  html += '<th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #e2e8f0;">Row</th>';
  
  Object.entries(columnLabels).forEach(([colKey, colLabel]) => {
    html += `<th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 12px; color: #475569; border-bottom: 1px solid #e2e8f0;">${colLabel}</th>`;
  });
  
  html += '</tr></thead><tbody>';
  
  // Table rows - limit if needed
  const displayRows = showLimitedView ? rows.slice(0, maxRows) : rows;
  const hiddenRows = showLimitedView ? totalRows - maxRows : 0;
  
  displayRows.forEach(([rowKey, rowData], index) => {
    const rowLabel = rowLabels[rowKey] || `Row ${index + 1}`;
    
    html += `<tr style="${index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;'}">`;
    html += `<td style="padding: 8px; font-weight: 500; color: #334155; border-bottom: 1px solid #e2e8f0;">${rowLabel}</td>`;
    
    // Add column data
    Object.entries(columnLabels).forEach(([colKey, colLabel]) => {
      const cellValue = typeof rowData === 'object' && rowData !== null ? rowData[colKey] : '';
      const displayValue = cellValue !== undefined && cellValue !== null ? String(cellValue) : '—';
      
      html += `<td style="padding: 8px; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${displayValue}</td>`;
    });
    
    html += '</tr>';
  });
  
  // Add summary row if data is limited
  if (showLimitedView) {
    html += `<tr style="background-color: #fffbeb; border-top: 2px solid #fed7aa;">`;
    html += `<td colspan="${Object.keys(columnLabels).length + 1}" style="padding: 12px; text-align: center; font-weight: 600; color: #92400e; font-size: 13px; border-bottom: none;">`;
    html += `Showing ${maxRows} of ${totalRows} rows`;
    if (hiddenColumns > 0) {
      html += ` and ${maxCols} of ${allColumnKeys.length} columns`;
    }
    html += ` • <a href="#" style="color: #4f46e5; text-decoration: underline;">View complete data in the system</a>`;
    html += `</td></tr>`;
  }
  
  html += '</tbody></table>';
  
  return html;
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
    
    // File upload object - cleaner display with clickable link
    if (value.url && (value.originalName || value.filename)) {
      const fileName = value.originalName || value.filename;
      const fileSize = value.size ? ` (${(value.size / 1024 / 1024).toFixed(2)} MB)` : '';
      // Create clickable link for file
      return `<a href="${value.url}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${fileName}${fileSize}</a>`;
    }
    
    // Handle Cloudinary file objects (raw resource type)
    if (value.url && value.resourceType === 'raw') {
      // Extract filename from URL if not provided directly
      const fileName = value.filename || value.originalName || value.url.split('/').pop() || 'Document';
      const fileSize = value.size ? ` (${(value.size / 1024 / 1024).toFixed(2)} MB)` : '';
      // Create clickable link for file
      return `<a href="${value.url}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${fileName}${fileSize}</a>`;
    }
    
    // Handle general file objects
    if (value.url && value.mimetype) {
      const fileName = value.filename || value.originalName || 'Uploaded File';
      const fileSize = value.size ? ` (${(value.size / 1024 / 1024).toFixed(2)} MB)` : '';
      // Create clickable link for file
      return `<a href="${value.url}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${fileName}${fileSize}</a>`;
    }
    
    // Check if this is a grid/table object with row-column structure
    const keys = Object.keys(value);
    
    // Enhanced grid detection - look for various patterns
    const hasRowPattern = keys.some(key => 
      key.startsWith('row') || key.startsWith('Row') || 
      key.startsWith('item') || key.startsWith('Item') ||
      key.match(/^\d+$/) // numeric keys
    );
    
    const hasColPattern = keys.some(key => 
      key.startsWith('col') || key.startsWith('Col') || 
      key.startsWith('column') || key.startsWith('Column')
    );
    
    // Check if this is a nested grid structure like {"row-1": {"col1": "value", "col2": "value"}}
    if (hasRowPattern) {
      // This is a grid with rows containing columns - use the new clean formatting
      return formatGridDataForEmail(value, fieldType === 'grid-table' ? { type: 'grid-table' } : null);
    }
    
    // Check if this is a flat column object like {"col1": "value", "col2": "value"}
    if (hasColPattern) {
      // Display grid/table object as a formatted string
      return Object.entries(value)
        .map(([colKey, colValue]) => `${colKey}: ${String(colValue)}`)
        .join('<br/>');
    }
    
    // Check for generic nested object that might be grid data
    if (keys.length > 0 && typeof value[keys[0]] === 'object') {
      // This might be a grid structure - try to format it
      const formattedEntries = Object.entries(value)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            const nestedValues = Object.entries(val)
              .map(([nestedKey, nestedVal]) => `${nestedKey}: ${String(nestedVal)}`)
              .join(', ');
            return `${key}: ${nestedValues}`;
          } else {
            return `${key}: ${String(val)}`;
          }
        })
        .join('<br/>');
      
      // Only return this if it looks like meaningful grid data
      if (formattedEntries.length > 20) {
        return formattedEntries;
      }
    }
    
    // Generic object - convert to clean string representation
    try {
      // For objects that are not file uploads or auto-user, create a cleaner display
      const cleanObject = {};
      Object.keys(value).forEach(key => {
        // Skip technical fields that users don't need to see
        if (!['mimetype', 'size', 'publicId', 'resourceType', 'fieldname', 'originalName', 'filename'].includes(key)) {
          cleanObject[key] = value[key];
        }
      });
      
      // If we have meaningful fields left, display them
      if (Object.keys(cleanObject).length > 0) {
        return Object.entries(cleanObject)
          .map(([key, val]) => `${key}: ${String(val)}`)
          .join(', ');
      }
      
      // Fallback to simple string representation
      return "[File Attachment]";
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
      },
      // Additional settings for Office 365 compatibility
      tls: {
        ciphers: 'SSLv3',
        requireTLS: true,
        // Allow self-signed certificates (use cautiously in production)
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3',
      requireTLS: true,
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
    }
  });
};

const transporter = createTransporter();

// Function to send email with error handling for authentication issues
const sendEmail = async (mailOptions) => {
  // Check if transporter is properly configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured - missing EMAIL_USER or EMAIL_PASS');
    console.warn('Email will be mocked but notification creation will continue');
    return Promise.resolve({ message: 'Email service not configured, mock send' });
  }
  
  try {
    // Test if transporter can authenticate
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    // Log email details before sending
    console.log('Attempting to send email to:', mailOptions.to);
    console.log('Email subject:', mailOptions.subject);
    
    // Send the actual email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId, info.response);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Failed email details - to:', mailOptions.to, 'subject:', mailOptions.subject);
    
    // If it's an authentication error, log a specific message
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('SMTP Authentication failed. This may be due to incorrect credentials or the need to use App Passwords for Office 365/Google accounts.');
      console.error('Please check your email configuration and ensure you are using App Passwords if required.');
    }
    
    // Return a mock response to allow the application to continue
    return {
      messageId: 'mock-message-id',
      response: 'Mock response - email sending disabled due to configuration issue',
      message: 'Email service unavailable, mock response returned'
    };
  }
};

/**
 * Resolve the appropriate sender email based on context
 * Implements hierarchical email sending: Super Admin → Company → Plant → Employee
 */
const resolveEmailSender = async ({ actor, companyId, plantId, fallbackFrom = '"Matapang" <no-reply@matapang.com>' }) => {
  try {
    // Always use the authenticated email for Office 365 compatibility
    // This prevents the SendAsDenied error by ensuring we only send from the authenticated address
    const authenticatedEmail = process.env.EMAIL_USER;
    if (!authenticatedEmail) {
      return fallbackFrom;
    }
    
    // Super Admin level
    if (actor === "SUPER_ADMIN") {
      return `"Matapang Platform" <${authenticatedEmail}>`;
    }

    // Company Admin level
    if (actor === "COMPANY_ADMIN" && companyId) {
      const company = await Company.findById(companyId).select("name");
      return `"${company?.name || 'Company'} Admin" <${authenticatedEmail}>`;
    }

    // Plant Admin or Employee level
    if ((actor === "PLANT_ADMIN" || actor === "EMPLOYEE") && plantId) {
      const plant = await Plant.findById(plantId).populate("companyId", "name").select("name");
      const fromName = plant?.name || plant?.companyId?.name || "Matapang";
      return `"${fromName}" <${authenticatedEmail}>`;
    }

    // Fallback to authenticated email
    return `"Matapang System" <${authenticatedEmail}>`;
  } catch (error) {
    console.error("Error resolving email sender:", error);
    // Always fall back to authenticated email for Office 365 compatibility
    const authenticatedEmail = process.env.EMAIL_USER;
    if (authenticatedEmail) {
      return `"Matapang System" <${authenticatedEmail}>`;
    }
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
         <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Plant:</strong> ${plant.name} ${plant.plantNumber ? `(${plant.plantNumber})` : ''}</p>
         ${plant.location ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Location:</strong> ${plant.location}</p>` : ''}
       </div>`
    : '';

  const companyFooterHtml = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 2px 0;"><strong>${company.name || 'Matapang'}</strong></p>
      ${company.address ? `<p style="margin: 2px 0;">${company.address}</p>` : ''}
    </div>
  `;

  // Removed duplicate login button - using the one in email content instead
  const loginButtonHtml = ``;

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

// Function to generate a complete form data summary for emails
const generateFormDataSummary = (formData, formFields = [], formDefinition = null, submissionLink = "#") => {
  if (!formData || typeof formData !== 'object') return '<p>No form data available</p>';
  
  const entries = Object.entries(formData);
  if (entries.length === 0) return '<p>No form data submitted</p>';
  
  // Create a field lookup for better labeling
  const fieldLookup = {};
  if (formFields && Array.isArray(formFields)) {
    formFields.forEach(field => {
      const fieldId = field.fieldId || field.id;
      if (fieldId) {
        fieldLookup[fieldId] = {
          label: field.label || field.question || field.title || fieldId,
          type: field.type || 'text',
          ...field
        };
      }
    });
  }
  
  let html = '<div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">';
  html += '<h3 style="color: #334155; margin-top: 0; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">Form Data Summary</h3>';
  
  entries.forEach(([fieldId, value]) => {
    // Skip technical fields
    if (['_id', 'id', '__v', 'createdAt', 'updatedAt', 'submittedAt'].includes(fieldId)) return;
    
    const fieldInfo = fieldLookup[fieldId] || { label: fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), type: 'text' };
    
    // Handle null/empty values
    if (value === null || value === undefined || value === "") {
      return; // Skip empty fields in summary
    }
    
    html += `<div style="margin-bottom: 12px; padding: 10px; background-color: white; border-radius: 6px; border-left: 3px solid #4f46e5;">`;
    html += `<div style="font-weight: 600; color: #334155; margin-bottom: 5px; font-size: 14px;">${fieldInfo.label}</div>`;
    
    // Format the value based on field type
    let formattedValue;
    if (typeof value === 'object' && value !== null) {
      // Handle grid/table data with our new clean formatting
      if (fieldInfo.type === 'grid-table' || 
          (Object.keys(value).some(key => key.startsWith('item') || key.startsWith('row')))) {
        // Use reasonable limits for email display (5 rows, 8 columns)
        // Pass submission link for large tables
        formattedValue = formatGridDataForEmail(value, fieldInfo, 5, 8, submissionLink);
      } else {
        // Handle other object types (file uploads, auto-user, etc.)
        formattedValue = formatFieldValue(value, fieldInfo.type);
      }
    } else {
      // Handle simple values
      formattedValue = formatFieldValue(value, fieldInfo.type);
    }
    
    html += `<div style="color: #475569; font-size: 13px; line-height: 1.4;">${formattedValue}</div>`;
    html += `</div>`;
  });
  
  html += `</div>`;
  return html;
};

// Export the global helpers that were previously shared
export {
  formatIST,
  getBaseUrl,
  formatFieldValue,
  formatGridDataForEmail,
  generateFormDataSummary,
  transporter,
  sendEmail,  // Added sendEmail function
  resolveEmailSender,
  getBaseLayout,
  removeDuplication
};
