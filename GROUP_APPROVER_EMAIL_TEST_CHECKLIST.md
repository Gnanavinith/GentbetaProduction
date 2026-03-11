# Group Approver Email Test Checklist

## Quick Test Steps

### ✅ Step 1: Verify Group Exists
- [ ] Go to `/plant/approval-groups`
- [ ] Check if you have a group with at least 2 members
- [ ] Example: "Shift Approvers" with Aravind & Gnana Vinith
- [ ] Note member email addresses

### ✅ Step 2: Create/Form with Group Approver
- [ ] Go to `/plant/forms/:id/edit/workflow`
- [ ] Set Level 1 to **"Group"** type
- [ ] Select your test group
- [ ] Save and Publish the form

### ✅ Step 3: Submit the Form
- [ ] Fill out the form fields
- [ ] Click **Submit**
- [ ] Confirm status is "PENDING_APPROVAL"

### ✅ Step 4: Check Backend Logs
Open terminal running backend (Terminal 12-38):
```bash
# Look for these success messages:
✅ Email transporter verified successfully
✅ Attempting to send email to: <member-email>
✅ Email sent successfully: <message-id>
✅ Email sent to group member <email> (<name>) for group <group-name>
```

### ✅ Step 5: Check Email Inboxes
- [ ] Login to first member's email (e.g., aravind@example.com)
  - [ ] Subject contains: "[Facility Submitted]"
  - [ ] Contains form name
  - [ ] Contains submitter name
  - [ ] Has "Review Submission" button
  - [ ] Link goes to approval page
  
- [ ] Login to second member's email (e.g., gnanavinith@example.com)
  - [ ] Same content as above
  - [ ] Both should receive within seconds

### ✅ Step 6: Check In-App Notifications
- [ ] Login as first member to the app
- [ ] Click notification bell icon
- [ ] Should see: "Group Approval Required"
- [ ] Click notification → Goes to approval detail page

### ✅ Step 7: Verify Pending Approvals
- [ ] Login as first member
- [ ] Go to `/employee/approval/pending`
- [ ] Form should appear in the list
- [ ] Click form → Opens detail page
- [ ] Can click "Approve" or "Reject" buttons

### ✅ Step 8: Test Approval (ANY_ONE Mode)
- [ ] First member clicks "Approve"
- [ ] Confirmation appears
- [ ] Second member tries to approve same form
- [ ] Should see: "This form has already been approved by another group member"
- [ ] Prevents duplicate approval ✅

## Expected Results

### What Each Member Receives:

**Email:**
```
To: aravind@example.com
Subject: [Facility Submitted] FORM-ID | Submitted by John Doe

Hello Aravind Kumar,

John Doe submitted the form "Test Form" at [timestamp].

You have been assigned as an approver for this form.

[Review Submission Button]
```

**In-App Notification:**
```
📬 Group Approval Required
Form Test Form waiting for approval from Shift Approvers
```

**Pending List:**
```
┌─────────────────────────────────────┐
│ Test Form                           │
│ Status: PENDING_APPROVAL            │
│ Current Level: 1                    │
│ Your Turn: YES                      │
└─────────────────────────────────────┘
```

## Troubleshooting

### ❌ No Emails Received

**Check 1: Email Service Configured**
```bash
# In backend terminal, look for:
⚠️ Email service not configured - missing EMAIL_USER or EMAIL_PASS
```
**Fix:** Add to `.env`:
```env
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password
```

**Check 2: Members Have Valid Emails**
```javascript
// In MongoDB shell:
db.approvalgroups.findOne(
  { groupName: "Test Approvers" },
  { members: 1 }
).members.forEach(m => print(m.email))
```
**Fix:** Update user profiles with valid emails

**Check 3: Frontend URL Set**
```bash
# Approval link should be valid URL
const approvalLink = `${process.env.FRONTEND_URL}/employee/approvals/${submission._id}`
```
**Fix:** Ensure `FRONTEND_URL` is set in `.env`

### ❌ Emails Going to Spam

**Fix:**
1. Whitelist sender email domain
2. Add company domain to safe senders list
3. Configure SPF/DKIM records for domain

### ❌ "Email transporter failed" Error

**Common Causes:**
1. Wrong SMTP credentials
2. Firewall blocking port 587/465
3. Two-factor authentication requiring app password

**Fix for Gmail/Office 365:**
- Use **App Password** instead of regular password
- Generate at: Google Account → Security → App Passwords

### ❌ Only Some Members Receive Emails

**Check:**
```bash
# Look for individual errors:
❌ Failed to send email to invalid@example.com: Error...
```
**Fix:**
- Update member's email in their profile
- Ensure email address is spelled correctly

## Success Criteria

All checks must pass:
- [ ] ✅ Backend logs show emails sent to ALL members
- [ ] ✅ All members received email notifications
- [ ] ✅ All members have in-app notifications
- [ ] ✅ Form appears in all members' pending list
- [ ] ✅ First approval locks for others (ANY_ONE mode)
- [ ] ✅ No errors in backend logs

## Rollback Plan

If issues occur, revert to previous behavior:

**Temporary Disable Email:**
```javascript
// In submission.controller.js line 172
// Comment out email sending temporarily:
/*
await sendSubmissionNotificationToApprover(
  member.email,
  ...
);
*/
```

**Keep In-App Notifications:**
```javascript
// This stays active:
await createNotification({
  userId: member._id,
  title: "Group Approval Required",
  message: `Form ${form.formName} waiting for approval from ${group.groupName}`,
  link: `/employee/approvals/${submission._id}`
});
```

---

**Test Completed:** _______________  
**Tester Name:** _______________  
**Result:** PASS / FAIL  
**Notes:** _______________
