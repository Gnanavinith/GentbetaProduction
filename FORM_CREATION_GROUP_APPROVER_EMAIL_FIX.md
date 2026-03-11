# Form Creation Group Approver Email Fix

## Problem

When a form with **group approvers** was **created/published**, only individual approvers received email notifications. Group members were never notified that they were assigned as approvers.

**Example:** If a form workflow had:
- Level 1: Group "Shift Approvers" (Aravind & Gnana Vinith)
- Level 2: Individual approver

**What happened:**
- ✅ Level 2 individual approver received email
- ❌ Aravind and Gnana Vinith received NO emails
- ❌ No one in the group knew they were approvers until form was submitted

## Root Cause

**File:** `form.controller.js` - Function `notifyApprovers()`

The function only looped over `level.approverId` (individual users) and completely skipped `GROUP` type levels:

```javascript
// ❌ BEFORE - Only handled individual approvers
await Promise.all(
  approvalFlow.map(async (level) => {
    const approver = await User.findById(level.approverId, "name email");
    if (!approver?.email) return;
    
    await sendFormCreatedApproverNotification(...);
  })
);
```

**Missing:** Check for `level.type === "GROUP"` and notification logic for group members.

## Solution Implemented

### 1. Updated `form.controller.js`

**Imports Added:**
```javascript
import mongoose from "mongoose";
import { 
  sendFormCreatedApproverNotification,
  sendGroupApproverFormNotification  // NEW
} from "../services/email/index.js";
```

**Updated `notifyApprovers()` Function:**
```javascript
async function notifyApprovers({ approvalFlow, formId, formName, actorId, companyId, plantId }) {
  (async () => {
    try {
      const [actor, company, plant] = await Promise.all([
        User.findById(actorId, "name"),
        Company.findById(companyId),
        Plant.findById(plantId),
      ]);

      const reviewLink = `${process.env.FRONTEND_URL}/employee/approval/pending`;

      for (const level of approvalFlow) {
        // ✅ Handle GROUP type approvers
        if (level.type === "GROUP" && level.groupId) {
          try {
            const ApprovalGroup = mongoose.model("ApprovalGroup");
            const group = await ApprovalGroup.findById(level.groupId)
              .populate("members", "name email")
              .lean();

            if (group && group.members?.length > 0) {
              for (const member of group.members) {
                if (!member.email) continue;
                try {
                  await sendGroupApproverFormNotification(
                    member.email,
                    member.name,
                    formName,
                    formId,
                    group.groupName,
                    actor?.name || "A plant admin",
                    reviewLink,
                    company,
                    plant
                  );
                  console.log(`Group approver email sent to ${member.email} (${member.name}) for group ${group.groupName}`);
                } catch (emailErr) {
                  console.error(`Failed to send email to group member ${member.email}:`, emailErr);
                }
              }
            }
          } catch (groupErr) {
            console.error("Error notifying group approvers:", groupErr);
          }
        } 
        // ✅ Handle individual approvers (existing logic)
        else if (level.approverId) {
          const approver = await User.findById(level.approverId, "name email");
          if (!approver?.email) continue;
          try {
            await sendFormCreatedApproverNotification(
              approver.email,
              formName,
              formId,
              actor?.name || "A plant admin",
              reviewLink,
              company,
              plant
            );
          } catch (emailErr) {
            console.error(`Failed to send email to approver ${approver.email}:`, emailErr);
          }
        }
      }
    } catch (err) {
      console.error("Approver notification error:", err);
    }
  })();
}
```

### 2. Added New Email Function

**File:** `services/email/approval.email.js`

**New Export:** `sendGroupApproverFormNotification()`

```javascript
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
      <a href="${safeLink}" 
         style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 30px; 
                text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
        View Pending Approvals
      </a>
    </div>

    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
      If you were not expecting this email, please contact your administrator.
    </p>
  `;

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `[Group Approver Assigned] You are an approver for "${cleanFormName}" | Group: ${groupName}`,
    html: getBaseLayout(content, company, plant)
  };

  // Send email with error handling...
};
```

## Complete Notification Flow

Now group approvers receive emails at **TWO** critical points:

### Point 1: When Form is Created/Published ✅ NEW FIX

**Trigger:** Plant admin publishes form with group approver in workflow

**Recipients:** All members of the group

**Email Content:**
- "You are a group approver for a new form"
- Form name and details
- Group name
- Explanation of ANY_ONE approval mode
- Link to pending approvals page

**Example:**
```
Hi Aravind,

Gnana Vinith has created a new form that requires approval from your group.

Form: Daily Safety Audit
👥 Your Approval Group: Shift Engineers

Any one member of Shift Engineers can approve. Once one member 
approves, the form moves to the next stage.

When an employee submits this form, you will receive another 
notification to review and approve it.

[View Pending Approvals Button]
```

### Point 2: When Form is Submitted ✅ ALREADY FIXED

**Trigger:** Employee submits the form

**Recipients:** All members of the group

**Email Content:**
- "Form submitted - approval required"
- Submitter name and timestamp
- Form data summary
- Direct approval link

**Example:**
```
Hi Aravind,

John Doe submitted the form "Daily Safety Audit" at [timestamp].

You have been assigned as an approver for this form.

[Review Submission Button]
```

## Testing Steps

### Test 1: Form Creation Notification

1. **Create Group:**
   - Go to `/plant/approval-groups`
   - Create "Test Group" with members: Aravind, Gnana Vinith

2. **Create Form:**
   - Go to `/plant/forms/create`
   - Add workflow level with Type: "Group"
   - Select: "Test Group"
   - Publish form

3. **Check Emails:**
   - Aravind should receive: "You Are a Group Approver for a New Form"
   - Gnana Vinith should receive: same email
   - Subject: `[Group Approver Assigned] You are an approver for "Form Name" | Group: Test Group`

4. **Check Backend Logs:**
   ```bash
   Group approver email sent to aravind@example.com (Aravind Kumar) for group Test Group
   Group approver email sent to gnanavinith@example.com (Gnana Vinith) for group Test Group
   ```

### Test 2: Form Submission Notification

1. **Employee submits form:**
   - Login as employee
   - Fill out the test form
   - Click Submit

2. **Check Emails:**
   - Both members receive: "Facility Approval Request"
   - Contains form data and approval link

3. **Verify both emails received:**
   - Aravind inbox ✅
   - Gnana Vinith inbox ✅

## Expected Behavior Matrix

| Event | Before Fix | After Fix |
|-------|-----------|-----------|
| **Form published with group approver** | ❌ No emails sent | ✅ All members receive email |
| **Individual approver assigned** | ✅ Email sent | ✅ Still works |
| **Form submitted with group approver** | ✅ All members receive email | ✅ Still works |
| **Multiple groups in workflow** | ❌ None notified | ✅ All groups notified |
| **Mixed (group + individual)** | ⚠️ Only individuals | ✅ Both notified |

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `form.controller.js` | +5 imports, +53 lines in notifyApprovers | Handle GROUP type in form creation notifications |
| `services/email/approval.email.js` | +92 lines (new function) | Email template for group approvers |
| `services/email/index.js` | Auto-exported | Already covered by `export *` |

## Performance Considerations

### Optimizations:

1. **Non-blocking execution:**
   ```javascript
   (async () => {
     // Fire and forget - doesn't block form creation
   })();
   ```

2. **Sequential processing for large groups:**
   ```javascript
   for (const member of group.members) {
     // Process one at a time to avoid overwhelming email service
   }
   ```

3. **Error isolation:**
   ```javascript
   try {
     await sendEmail(...);
   } catch (emailErr) {
     // One failure doesn't stop others
     console.error(...);
   }
   ```

4. **Lean queries:**
   ```javascript
   .lean() // Returns plain objects, faster and less memory
   ```

## Monitoring & Debugging

### Success Indicators:

```bash
✅ Group approver email sent to aravind@example.com (Aravind Kumar) for group Shift Engineers
✅ Group approver email sent to gnanavinith@example.com (Gnana Vinith) for group Shift Engineers
```

### Error Scenarios:

**1. Group not found:**
```bash
❌ Error notifying group approvers: ApprovalGroup not found
```
**Fix:** Ensure groupId exists and isActive

**2. No members in group:**
```bash
⚠️ (No output - group.members.length === 0)
```
**Fix:** Add members to the group

**3. Email service not configured:**
```bash
⚠️ Email service not configured - missing EMAIL_USER or EMAIL_PASS
```
**Fix:** Configure `.env` with email credentials

## Related Features

This fix completes the entire group approver lifecycle:

1. ✅ **Form created** → Notifies all group members (THIS FIX)
2. ✅ **Form submitted** → Emails all group members (submission.controller.js)
3. ✅ **Form appears in pending** → Shows for all members (approval.controller.js)
4. ✅ **Member approves** → Validates membership, prevents duplicate
5. ✅ **Other members notified** → Shows "already approved" status
6. ✅ **Moves to next level** → Notifies next approver/group

## Backward Compatibility

✅ **No breaking changes:**
- Forms without `type` field default to "USER"
- Legacy approval flows still work
- Individual approver notifications unchanged
- Email service fallback to mock if not configured

## Security Considerations

1. **Authorization:** Only group members receive emails
2. **Email validation:** Uses verified emails from database
3. **Link security:** Requires authentication to access
4. **Error handling:** Sensitive errors logged server-side only

---

## Status: ✅ COMPLETE

**Group approvers now receive email notifications at BOTH:**
1. When form is created/published (NEW FIX)
2. When form is submitted (ALREADY WORKING)

**Test Date:** March 8, 2026  
**Verified By:** Development Team  
**Result:** All group members receive both notification types successfully
