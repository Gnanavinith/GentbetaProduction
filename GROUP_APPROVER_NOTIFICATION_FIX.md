# Group Approver Notification Fix

## Issue Description
When a group approver was set in the approval workflow, notifications had multiple issues:
1. **Incorrect notification titles** - Used "New Form Available" instead of "Group Approval Required"
2. **Vague notification messages** - Didn't clearly indicate who submitted and what action is needed
3. **Missing email notifications in submitDraft** - Group members only received in-app notifications when draft was submitted

Users expected:
- **Title**: "Group Approval Required"
- **Message**: "{submitterName} submitted "{formName}" — your group ({groupName}) needs to approve it"
- **Email**: Sent to all group members in both createSubmission and submitDraft

## Root Cause Analysis
The notification system had partial functionality but with several issues:
- ❌ Title used "New Form Available" instead of "Group Approval Required"
- ❌ Message was vague: "Form {formName} waiting for approval from {groupName}"
- ❌ In `submitDraft`, only in-app notifications were sent (no email)
- ❌ Missing context about who submitted the form

## Solution Implemented

### Changes Made to `submission.controller.js`

#### 1. **createSubmission Function** (Lines 160-167)
Updated the in-app notification for group members with correct title, message, and email:

```javascript
// BEFORE
await createNotification({
  userId: member._id,
  title: "New Form Available",
  message: `A form requiring ${group.groupName} approval has been submitted and is awaiting your review`,
  link: `/employee/approvals/${submission._id}`
});
// ❌ No email sent

// AFTER
await createNotification({
  userId: member._id,
  title: "Group Approval Required",
  message: `${user.name || "An employee"} submitted "${form.formName}" — your group (${group.groupName}) needs to approve it`,
  link: `/employee/approvals/${submission._id}`
});

// ✅ Email also sent to each group member
if (member.email) {
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
  );
}
```

#### 2. **submitDraft Function** (Lines 747-782)
Fixed both notification message AND added email sending:

```javascript
// BEFORE - Wrong title, wrong message, NO EMAIL
await createNotification({
  userId: member._id,
  title: "New Form Available",
  message: `Group approver (${group.groupName}) is now available for your review`,
  link: `/employee/approvals/${submission._id}`
});
// ❌ No email sent at all

// AFTER - Correct title, message, AND email
await createNotification({
  userId: member._id,
  title: "Group Approval Required",
  message: `${submission.submittedByName || "An employee"} submitted "${form.formName}" — your group (${group.groupName}) needs to approve it`,
  link: `/employee/approvals/${submission._id}`
});

// ✅ Email now sent in submitDraft as well
if (member.email) {
  await sendSubmissionNotificationToApprover(
    member.email,
    form.formName,
    submission.submittedByName || "An employee",
    submission.submittedAt,
    approvalLink,
    [],
    company,
    plant,
    plantIdStr,
    formIdStr,
    submissionIdStr
  );
}
```

## Complete Notification Flow for Group Approvers

### When a Form is Submitted:

1. **Plant Admin Notification**
   - In-app notification created
   - Email sent with form details

2. **Group Member Notifications** (for GROUP type approvers)
   - ✅ Each group member receives an **in-app notification** with title "Group Approval Required"
   - ✅ Message clearly states who submitted and which form: `{submitter} submitted "{formName}" — your group ({groupName}) needs to approve it`
   - ✅ Each group member receives an **email notification** with submission details
   - ✅ Email sent in BOTH `createSubmission` and `submitDraft`
   - ✅ Notification includes direct link to approval page

3. **Email Content**
   - Subject: `[Facility Submitted] {submissionId} | Submitted by {submitterName}`
   - Includes form name, submitter name, submission time
   - Includes selected form fields (if configured)
   - Call-to-action button to review submission

### Notification Recipients:
- All active members of the approval group
- Plant admin (separate notification)

## Key Features

### ✅ Comprehensive Coverage
- Notifications sent in both `createSubmission` and `submitDraft` functions
- Handles both individual and group approvers
- Supports multi-level approval workflows

### ✅ Duplicate Prevention
The `createNotification` utility function prevents duplicate notifications by checking:
```javascript
const existingNotification = await Notification.findOne({
  userId,
  title,
  message
});
```

### ✅ Error Handling
- Try-catch blocks around email sending
- Graceful degradation if email fails (in-app notification still created)
- Detailed error logging for debugging

### ✅ Email Sender Hierarchy
Uses appropriate sender based on context:
- Super Admin → Company Admin → Plant Admin → Employee
- Falls back to authenticated email for Office 365 compatibility

## Testing Checklist

### Manual Testing Steps:

1. **Create an Approval Group**
   - Navigate to Approval Groups
   - Create a new group with multiple members
   - Verify all members are from the same plant

2. **Assign Group to Workflow**
   - Create or edit a form
   - Add approval workflow
   - Set Level 1 approver type to "GROUP"
   - Select the created group

3. **Submit Form**
   - As an employee, fill out and submit the form
   - Check that status changes to "PENDING_APPROVAL"

4. **Verify Notifications**
   
   **For Group Members:**
   - ✅ Check notification bell - should show "New Form Available"
   - ✅ Message should mention the group name
   - ✅ Click notification - should navigate to approval page
   - ✅ Check email inbox - should receive detailed submission email
   
   **For Plant Admin:**
   - ✅ Should receive separate notification about new submission
   - ✅ Email should include form data summary

5. **Test Draft Submission**
   - Save form as DRAFT
   - Later, submit the draft
   - Verify same notifications are triggered

6. **Multi-Level Workflow**
   - Create workflow with multiple levels
   - First level: Group approver
   - Second level: Individual approver
   - Submit form and verify only first level gets notified initially

## Expected Behavior After Fix

### Group Member Experience:
1. Receives notification immediately upon form submission
2. Notification title clearly indicates action needed: "Group Approval Required"
3. Message specifies who submitted, which form, and which group needs to approve
4. Can click notification to go directly to approval page
5. Receives email with comprehensive submission details
6. **Email sent in both createSubmission and submitDraft scenarios**

### System Behavior:
1. All group members notified simultaneously
2. No duplicate notifications created
3. Errors in email sending don't prevent in-app notifications
4. Proper logging for troubleshooting

## Related Files

### Modified:
- `GENBETA-BACKEND/src/controllers/submission.controller.js`
  - `createSubmission` function (lines 160-167)
  - `submitDraft` function (lines 747-752)

### Supporting Files (No Changes):
- `GENBETA-BACKEND/src/utils/notify.js` - Notification creation logic
- `GENBETA-BACKEND/src/services/email/approval.email.js` - Email template
- `GENBETA-BACKEND/src/models/ApprovalGroup.model.js` - Group schema
- `GENBETA-BACKEND/src/controllers/approvalGroup.controller.js` - Group management

## Database Schema Reference

### ApprovalGroup Model
```javascript
{
  groupName: String,
  description: String,
  members: [ObjectId], // References User model
  companyId: ObjectId,
  plantId: ObjectId,
  createdBy: ObjectId,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### FormSubmission Model (Relevant Fields)
```javascript
{
  formId: ObjectId,
  submittedBy: ObjectId,
  status: String, // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
  currentLevel: Number,
  approvalHistory: [{
    level: Number,
    status: String,
    approverId: ObjectId,
    approvedAt: Date,
    comments: String
  }]
}
```

## Future Enhancements

### Potential Improvements:
1. **Group Notification Settings**
   - Allow members to choose notification preferences (instant vs digest)
   - Option to mute specific group notifications

2. **Approval Delegation**
   - Allow group members to delegate their approval rights temporarily
   - Auto-delegate when member is unavailable

3. **Notification Analytics**
   - Track average approval time per group member
   - Monitor notification open rates

4. **Escalation Rules**
   - Auto-escalate if no group member responds within SLA
   - Notify backup approvers

## Conclusion

This fix ensures that when a group approver is configured in the workflow:
- ✅ All group members receive clear, actionable notifications with correct title
- ✅ Messages provide full context (who submitted, what form, which group)
- ✅ Both in-app and email notifications are sent consistently
- ✅ Email notifications work in both `createSubmission` and `submitDraft`
- ✅ Messaging is consistent and professional
- ✅ Users can quickly access and review pending submissions

The implementation maintains backward compatibility while significantly improving user experience and clarity.
