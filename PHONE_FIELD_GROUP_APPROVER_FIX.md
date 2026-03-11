# Phone Field Not Sending to Group Approvers - Debug & Fix

## Problem Statement

When a form with a **phone field** is submitted:
- ✅ **Individual approvers** receive the phone field data in their email
- ❌ **Group approvers** do NOT receive the phone field data in their email

**Example URL**: http://localhost:5173/employee/fill-template/69b034166ee4654908b0734b

## Root Cause Analysis

After analyzing the code, I've identified the potential issues:

### Issue #1: Field ID Matching (Most Likely)

The email template tries to match field values using multiple strategies:

```javascript
const fieldValue = submissionData[field.id] ||        // Strategy 1: UUID
  submissionData[field.fieldId] ||                    // Strategy 2: fieldId (e.g., "phone_field")
  submissionData[field.label?.toLowerCase().replace(/\s+/g, '_')] ||  // Strategy 3: label-based
  '—';
```

**Problem**: Phone fields might be using a different ID format than expected.

### Issue #2: Missing `includeInApprovalEmail` Flag

The phone field must have the `includeInApprovalEmail` toggle enabled in the Plant Admin form designer. If this flag is not set, the field won't appear in approval emails.

### Issue #3: Data Not Properly Saved

The phone field value might not be properly saved to `submission.data` during form submission.

## Solution Implemented

### 1. Enhanced Field Value Matching

**File**: `GENBETA-BACKEND/src/services/email/approval.email.js`

Added an additional matching strategy for field labels with hyphens:

```javascript
const fieldValue = submissionData[field.id] ||
  submissionData[field.fieldId] ||
  submissionData[field.label?.toLowerCase().replace(/\s+/g, '_')] ||
  submissionData[field.label?.toLowerCase().replace(/\s+/g, '-')] ||  // NEW
  '—';
```

### 2. Added Debug Logging

Added comprehensive logging to track phone field data:

```javascript
// Debug logging for phone field troubleshooting
console.log('=== Email Notification Debug ===');
console.log('Total form fields:', formFields.length);
console.log('Fields with includeInApprovalEmail=true:', approvalFields.length);
console.log('Phone fields in form:', formFields.filter(f => f.type === 'phone').map(f => ({ 
  id: f.id, 
  fieldId: f.fieldId, 
  label: f.label 
})));
console.log('Submission data keys:', Object.keys(submissionData));
console.log('Submission data sample:', JSON.stringify(Object.fromEntries(Object.entries(submissionData).slice(0, 5)), null, 2));

// Special handling for phone fields
if (field.type === 'phone') {
  console.log(`\nPhone field found: ${field.label}`);
  console.log(`  - Field ID: ${field.id}`);
  console.log(`  - Field ID alternate: ${field.fieldId}`);
  console.log(`  - Looking up value, found: ${fieldValue}`);
  console.log(`  - Raw value from data[field.id]: ${submissionData[field.id]}`);
  console.log(`  - Raw value from data[field.fieldId]: ${submissionData[field.fieldId]}`);
}
```

## Testing Steps

### Step 1: Verify Field Configuration

1. Navigate to Plant Admin → Form Designer
2. Open the form with the phone field
3. Click on the phone field
4. Ensure **"Include in email to approvers"** toggle is **ON**
5. Save the form

### Step 2: Submit Form with Phone Number

1. Go to: http://localhost:5173/employee/fill-template/69b034166ee4654908b0734b
2. Fill in the phone field with a test number (e.g., "1234567890")
3. Fill in other required fields
4. Submit the form

### Step 3: Check Backend Logs

Watch the backend terminal for debug output like:

```
=== Email Notification Debug ===
Total form fields: 5
Fields with includeInApprovalEmail=true: 3
Phone fields in form: [ { id: 'abc123', fieldId: 'phone_field', label: 'Phone Number' } ]
Submission data keys: [ 'name', 'email', 'phone_field', 'department' ]
Submission data sample: {
  "name": "Test User",
  "email": "test@example.com",
  "phone_field": "1234567890"
}

Phone field found: Phone Number
  - Field ID: abc123
  - Field ID alternate: phone_field
  - Looking up value, found: 1234567890
  - Raw value from data[field.id]: undefined
  - Raw value from data[field.fieldId]: 1234567890
```

### Step 4: Analyze the Logs

**What to look for:**

✅ **Working correctly:**
- Phone field appears in "Phone fields in form" array
- Submission data contains the phone value
- "Looking up value, found:" shows the actual phone number
- Email should contain the phone field

❌ **Problem indicators:**
- Phone field NOT in "Phone fields in form" → Field doesn't have `includeInApprovalEmail` enabled
- Submission data keys don't include phone field → Data not being saved
- "Looking up value, found: —" → Field ID mismatch

### Step 5: Check Group Approver Email

The group approver should receive an email with:

```
Selected Submission Details
┌──────────────────────────────────────┐
│ Field Name      │ Value              │
├──────────────────────────────────────┤
│ Phone Number    │ 1234567890         │
│ ... other fields ...                 │
└──────────────────────────────────────┘
```

## Common Issues & Solutions

### Issue: Phone Field Not in "Phone fields in form" Array

**Cause**: `includeInApprovalEmail` flag is not enabled

**Solution**:
1. Go to Plant Admin → Form Designer
2. Click on the phone field
3. Scroll to "Approval Email" section
4. Turn ON the toggle
5. Save the form

### Issue: Field ID Mismatch

**Symptoms**: Logs show:
```
Raw value from data[field.id]: undefined
Raw value from data[field.fieldId]: undefined
```

**Cause**: The field ID in the form definition doesn't match the key in submission data

**Solution**:
1. Check the form definition in MongoDB
2. Verify `field.fieldId` matches the submission data key
3. If needed, regenerate the field ID or update the form

### Issue: Data Not Being Saved

**Symptoms**: Submission data keys don't include the phone field

**Cause**: Frontend not sending phone field value or backend not processing it

**Solution**:
1. Check frontend form submission payload
2. Verify phone field has proper `name` or `id` attribute
3. Check backend file upload processing logic

## Code Locations

### Files Modified:
1. **approval.email.js** - Enhanced field matching and debug logging
2. **submission.controller.js** - Already passes form.fields and submission.data (lines 128-129)
3. **formTask.controller.js** - Already passes form.fields and submission.data (lines 201-202)

### Key Functions:
- `sendSubmissionNotificationToApprover()` in `approval.email.js` (line 76)
- Field value matching logic (lines 149-160)
- Debug logging (lines 147-167)

## Expected Behavior After Fix

### Individual Approver Email:
```
Selected Submission Details
Phone Number: 1234567890 ✅
```

### Group Approver Email:
```
Selected Submission Details
Phone Number: 1234567890 ✅
```

Both should now display the phone field identically!

## Next Steps

1. **Test the fix** by submitting a form with a phone field
2. **Check backend logs** for debug output
3. **Verify group approver email** contains the phone field
4. **If still not working**, share the backend logs so we can identify the exact mismatch

## Additional Notes

- The debug logging will only appear in the backend terminal when emails are sent
- Remove debug logs after confirming the fix works (optional)
- This fix applies to ALL field types, not just phone fields
- The enhanced matching now supports label-based lookup with both underscores and hyphens

---

**Status**: Debug logging added, enhanced field matching implemented  
**Date**: March 10, 2026  
**Fix Type**: Enhanced debugging + improved field value matching
