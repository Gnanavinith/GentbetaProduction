# Group Approval Email - IncludeInApprovalEmail Field Fix ✅

## Problem

When a form with **group approvers** was submitted, the "Include in email to approvers" field setting was being ignored. Emails sent to group members did **NOT** include the selected form fields, even when `includeInApprovalEmail` was set to `true`.

---

## Root Cause

The `sendSubmissionNotificationToApprover()` email function accepts these parameters:

```javascript
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
  formFields = [],        // ← NOT passed for group emails
  submissionData = {},    // ← NOT passed for group emails
  actor = "PLANT_ADMIN",
 companyId = null,
  submitterEmail = null
) => {
  // Line 105: Filters fields with includeInApprovalEmail
 const approvalFields = formFields.filter(field => field.includeInApprovalEmail);
  
  // Lines 107-135: Generates HTML table with selected fields
  // ...
}
```

However, when sending emails to **group members**, the controllers were only passing 11 parameters and **omitting**:
- `formFields` (array of all form fields with `includeInApprovalEmail` flag)
- `submissionData` (actual submitted data values)

This caused the email template to have no fields to display, so the "Selected Submission Details" section was empty or missing.

---

## Solution

Updated **3 backend controller files** to pass `formFields` and `submissionData` when sending emails to group members:

### 1. ✅ submission.controller.js (Line 172-184)

**BEFORE:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName,
  user.name || "An employee",
  submission.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantId,
  formId,
  submissionId
  // ❌ Missing formFields
  // ❌ Missing submissionData
);
```

**AFTER:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName,
  user.name || "An employee",
  submission.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantId,
  formId,
  submissionId,
  form.fields || [],           // ✅ Pass form fields with includeInApprovalEmail settings
  parsedData,                  // ✅ Pass submission data
  "EMPLOYEE",
  user.companyId,
  user.email
);
```

---

### 2. ✅ approval.controller.js (Line 646-658)

**BEFORE:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName || form.templateName,
  submitter?.name || "An employee",
  submission.createdAt,
  approvalLink,
  previousApprovals,
 company,
  plant,
  plantId,
  formId,
  submissionId
  // ❌ Missing formFields
  // ❌ Missing submissionData
);
```

**AFTER:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName || form.templateName,
  submitter?.name || "An employee",
  submission.createdAt,
  approvalLink,
  previousApprovals,
 company,
  plant,
  plantId,
  formId,
  submissionId,
  form?.fields || [],          // ✅ Pass form fields
  submission.data || {},       // ✅ Pass submission data
  "PLANT_ADMIN",
  submission.companyId?.toString() || null,
  submitter?.email || null
);
```

---

### 3. ✅ formTask.controller.js (TWO locations)

#### Location 1: Lines 181-193

**BEFORE:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName,
 req.user.name || "Employee",
  submissionData.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantIdStr,
  formIdStr,
  submissionIdStr
  // ❌ Missing formFields
  // ❌ Missing submissionData
);
```

**AFTER:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  form.formName,
 req.user.name || "Employee",
  submissionData.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantIdStr,
  formIdStr,
  submissionIdStr,
  form.fields || [],           // ✅ Pass form fields
  submissionData.data || {},   // ✅ Pass submission data
  "PLANT_ADMIN",
  submissionData.companyId,
 req.user.email || null
);
```

#### Location 2: Lines 484-496

**BEFORE:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  submissionData.formName,
  submissionData.submittedByName,
  submissionData.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantIdStr,
  formIdStr,
  submissionIdStr
  // ❌ Missing formFields
  // ❌ Missing submissionData
);
```

**AFTER:**
```javascript
await sendSubmissionNotificationToApprover(
  member.email,
  submissionData.formName,
  submissionData.submittedByName,
  submissionData.submittedAt,
  approvalLink,
  [],
 company,
  plant,
  plantIdStr,
  formIdStr,
  submissionIdStr,
  form.fields || [],           // ✅ Pass form fields
  submissionData.data || {},   // ✅ Pass submission data
  "PLANT_ADMIN",
  submissionData.companyId,
  submissionData.submittedByEmail || null
);
```

---

## How It Works Now

### Email Flow with Group Approvers:

```
┌─────────────────────────────────────┐
│ Employee Submits Form              │
│ (with group approval workflow)     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Backend Creates Submission         │
│ - Saves form.fields array          │
│ - Saves submission.data object      │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Identifies First Level = GROUP     │
│ Fetches ApprovalGroup members       │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ For Each Group Member:             │
│ 1. Create in-app notification       │
│ 2. Send email WITH:                 │
│    - form.fields (with flags)       │
│    - submission.data (values)       │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Email Template Renders:            │
│ - Filters fields by                 │
│   includeInApprovalEmail=true       │
│ - Displays "Selected Submission     │
│   Details" table with values        │
└─────────────────────────────────────┘
```

---

## Email Template Logic

From `approval.email.js` (Lines 105-135):

```javascript
// Filter fields that have includeInApprovalEmail enabled
const approvalFields = formFields.filter(field => field.includeInApprovalEmail);

let approvalSummaryHtml = '';
if (approvalFields.length > 0) {
 const summaryRows = approvalFields.map(field => {
    // Get value from submission data
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
```

---

## Testing Checklist

### Test Case 1: Group Approver Email with Fields Enabled

1. Create a form with these fields:
   - Field A: `includeInApprovalEmail = true`
   - Field B: `includeInApprovalEmail = false`
   - Field C: `includeInApprovalEmail = true`
2. Set up approval workflow with a **Group** as first level
3. Submit the form with values for all fields
4. Check email received by group members

**Expected Result:**
- ✅ Email contains "Selected Submission Details" section
- ✅ Shows Field A with its value
- ✅ Shows Field C with its value
- ✅ Does NOT show Field B
- ✅ Table is properly formatted with styling

### Test Case 2: Group Approver Email with No Fields Enabled

1. Create a form where ALL fields have `includeInApprovalEmail = false`
2. Set up group approval workflow
3. Submit the form
4. Check email received by group members

**Expected Result:**
- ✅ Email does NOT contain "Selected Submission Details" section
- ✅ Email still has proper header and body content
- ✅ "Review Submission" button is present

### Test Case 3: Individual Approver (Should Still Work)

1. Create a form with some fields enabled for email
2. Set up individual approver workflow
3. Submit the form
4. Check email received by approver

**Expected Result:**
- ✅ Email shows selected fields correctly
- ✅ No regression in existing functionality

### Test Case 4: Multi-Level Group Approval

1. Create form with 3-level approval:
   - Level 1: Group A
   - Level 2: Individual approver
   - Level 3: Group B
2. Enable some fields for email
3. Submit form
4. Check emails at each level

**Expected Result:**
- ✅ Level 1 (Group A): All members receive email with selected fields
- ✅ Level 2 (Individual): Receives email with selected fields + previous approval context
- ✅ Level 3 (Group B): All members receive email with selected fields + previous approval context

---

## Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `submission.controller.js` | 172-184 | Added formFields + submissionData to group email call |
| `approval.controller.js` | 646-658 | Added formFields + submissionData to next-level group email |
| `formTask.controller.js` | 181-193 | Added formFields + submissionData (first location) |
| `formTask.controller.js` | 484-496 | Added formFields + submissionData (second location) |

---

## Impact

### Before Fix:
- ❌ Group members received generic emails without field details
- ❌ Had to click through to see submission content
- ❌ Inconsistent with individual approver emails
- ❌ "Include in email" setting was ignored for groups

### After Fix:
- ✅ Group members receive detailed emails with selected fields
- ✅ Can see important information before clicking
- ✅ Consistent experience across all approver types
- ✅ "Include in email" setting works for everyone

---

## Example Email Output

### HTML Table Rendered in Email:

```html
<div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; overflow: hidden;">
  <div style="background-color: #f3f4f6; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
    <h4 style="margin: 0; color: #1f2937; font-size: 16px;">Selected Submission Details</h4>
  </div>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Department Name</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Safety & Compliance</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Inspection Date</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">March 9, 2026</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Risk Level</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Medium</td>
    </tr>
  </table>
</div>
```

### Visual Appearance:

```
╔═══════════════════════════════════════════╗
║  Selected Submission Details              ║
╠═══════════════════════════════════════════╣
║  Department Name    │ Safety & Compliance ║
║  Inspection Date    │ March 9, 2026       ║
║  Risk Level         │ Medium              ║
╚═══════════════════════════════════════════╝
```

---

## Technical Notes

### Data Availability:

All three controllers have access to:
- `form.fields` - Array of field definitions with `includeInApprovalEmail` flag
- `submission.data` or `parsedData` - Object containing submitted values

### Parameter Order Matters:

The function signature expects parameters in this exact order:
1. `to` (email address)
2. `formName`
3. `submitterName`
4. `submittedAt`
5. `link`
6. `previousApprovals`
7. `company`
8. `plant`
9. `plantId`
10. `formId`
11. `submissionId`
12. `formFields` ← Added here
13. `submissionData` ← Added here
14. `actor`
15. `companyId`
16. `submitterEmail`

### Backward Compatibility:

The function has default values for the last 3 parameters:
- `actor = "PLANT_ADMIN"`
- `companyId = null`
- `submitterEmail = null`

So adding them explicitly is optional but recommended for clarity.

---

## Related Files

### Email Service:
- `GENBETA-BACKEND/src/services/email/approval.email.js`

### Controllers:
- `GENBETA-BACKEND/src/controllers/submission.controller.js`
- `GENBETA-BACKEND/src/controllers/approval.controller.js`
- `GENBETA-BACKEND/src/controllers/formTask.controller.js`

### Models:
- `GENBETA-BACKEND/src/models/Form.model.js` (defines `fields.includeInApprovalEmail`)
- `GENBETA-BACKEND/src/models/FormSubmission.model.js` (stores `data` object)

---

## Migration Script

If you need to add the `includeInApprovalEmail` field to existing forms:

```bash
# Run the migration script
node GENBETA-BACKEND/scripts/addApprovalEmailFlag.js
```

This sets `includeInApprovalEmail = false` by default for all existing fields.

---

## Summary

✅ **Fixed:** Group approvers now receive emails with selected form fields displayed  
✅ **Consistency:** Same email format for individual and group approvers  
✅ **User Experience:**Approvers can see relevant info before clicking through  
✅ **Respects Settings:** `includeInApprovalEmail` flag now works for everyone  

**The "Include in email to approvers" field setting now works correctly for group approvals!** 🎉
