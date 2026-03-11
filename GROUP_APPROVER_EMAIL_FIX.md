# Group Approver Email Notification Fix

## Problem

When a form with a **group approver** was submitted, **emails were NOT being sent** to group members. Only in-app notifications were created.

**Example**: If a group contains `aravind` and `gnanavinith`, neither would receive an email notification when a form requiring their group's approval was submitted.

## Root Cause

In `submission.controller.js`, the `createSubmission` function only created **in-app notifications** for group members but did **NOT send emails**:

```javascript
// ❌ BEFORE - Only in-app notification
for (const member of group.members) {
  await createNotification({
    userId: member._id,
    title: "Group Approval Required",
    message: `Form ${form.formName} waiting for approval from ${group.groupName}`,
    link: `/employee/approvals/${submission._id}`
  });
  console.log(`Notification sent to group member ${member.email} for group approval`);
}
```

**Missing**: Email notification via `sendSubmissionNotificationToApprover()`

## Solution

### Updated: submission.controller.js (createSubmission function)

Added email notifications to all group members when a form is submitted with a group as the first-level approver:

```javascript
if (firstLevelApprover.type === "GROUP" && firstLevelApprover.groupId) {
  // Handle group approver - notify all group members
  const ApprovalGroup = mongoose.model("ApprovalGroup");
  const group = await ApprovalGroup.findById(firstLevelApprover.groupId)
    .populate("members", "name email _id")
    .lean();
  
  if (group && group.members && group.members.length > 0) {
    // Fetch company and plant details once
    const company = await Company.findById(user.companyId);
    const plant = await Plant.findById(user.plantId);
    const plantId = plant?.plantNumber || plant?._id?.toString() || user.plantId?.toString() || "";
    const formId = form.formId || form._id?.toString() || "";
    const submissionId = submission._id?.toString() || "";
    const approvalLink = `${process.env.FRONTEND_URL}/employee/approvals/${submission._id}`;
    
    for (const member of group.members) {
      // ✅ Create in-app notification
      await createNotification({
        userId: member._id,
        title: "Group Approval Required",
        message: `Form ${form.formName} waiting for approval from ${group.groupName}`,
        link: `/employee/approvals/${submission._id}`
      });
      
      // ✅ Send email notification to each group member
      if (member.email) {
        await sendSubmissionNotificationToApprover(
          member.email,
          form.formName,
          user.name || "An employee",
          submission.submittedAt,
          approvalLink,
          [], // No previous approvals yet
          company,
          plant,
          plantId,
          formId,
          submissionId
        );
        console.log(`Email sent to group member ${member.email} (${member.name}) for group ${group.groupName}`);
      }
    }
  }
}
```

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| **In-app notification** | ✅ Yes | ✅ Still yes |
| **Email notification** | ❌ No | ✅ **YES** - sent to all group members |
| **Company/Plant context** | ❌ Not fetched | ✅ Fetched once and reused |
| **Error handling** | Basic | ✅ Try-catch per email |
| **Logging** | Generic | ✅ Detailed with member name and group |

## Email Content

Each group member receives an email with:
- **Form name**
- **Submitter name**
- **Submission date**
- **Direct approval link**
- **Company and plant branding**
- **Context** that they're receiving this as part of a group approver

## Testing Steps

1. **Create an approval group:**
   - Go to `/plant/approval-groups`
   - Create group named "Shift Approvers"
   - Add members: `aravind@example.com`, `gnanavinith@example.com`

2. **Create a form with group approver:**
   - Go to `/plant/forms/:id/edit/workflow`
   - Set Level 1 to "Group" type
   - Select "Shift Approvers" group

3. **Submit the form:**
   - Fill out and submit the form

4. **Verify emails received:**
   - Check `aravind@example.com` inbox ✅
   - Check `gnanavinith@example.com` inbox ✅
   - Both should receive identical emails with approval link

5. **Verify in-app notifications:**
   - Login as aravind → Check notifications ✅
   - Login as gnanavinith → Check notifications ✅

## Additional Scenarios Covered

### Scenario 2: Form moves to group at later level

Already working in `approval.controller.js` (lines 619-666):
- When Level 1 approves and Level 2 is a group
- All group members receive email + in-app notification
- Includes previous approver name in email

### Scenario 3: Group member approves

Already working in `approval.controller.js`:
- Validates group membership
- Checks if another member already approved (ANY_ONE mode)
- Records approval with `isGroupApproval: true`

## Files Modified

| File | Function | Lines Changed |
|------|----------|---------------|
| `submission.controller.js` | `createSubmission` | +31 / -1 |
| `approval.controller.js` | `processApproval` | Already had email logic ✅ |

## Related Features

This fix completes the group approver email notification flow:

1. ✅ **Form submission** → Emails all group members (THIS FIX)
2. ✅ **Form moves to group level** → Emails all group members (already working)
3. ✅ **Group member approves** → Validates membership, prevents duplicate
4. ✅ **Other members notified** → Shows "already approved" message
5. ✅ **Form moves to next level** → Notifies next approver/group

## Expected Behavior Now

**Before:**
- Group members only saw in-app notification when logging in
- No email alert about new form requiring approval

**After:**
- ✅ Immediate email to ALL group members
- ✅ In-app notification also created
- ✅ Clear approval link in email
- ✅ Form shows in pending approvals page

## Monitoring

Check backend logs after form submission:
```
Email sent to group member aravind@example.com (Aravind Kumar) for group Shift Approvers
Email sent to group member gnanavinith@example.com (Gnana Vinith) for group Shift Approvers
```

If you see errors:
```
Failed to send email to member@example.com: <error details>
```
Check email service configuration and member email addresses.
