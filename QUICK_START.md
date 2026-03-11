# 🚀 Quick Start Guide - Group Approver Feature

## 5-Minute Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd "c:/Users/ADMIN/Desktop/Genbata Production/GentbetaProduction/GENBETA-BACKEND"
npm start
```

Wait for: `Server running on port 5000` ✅

### Step 2: Start Frontend (Terminal 2)
```bash
cd "c:/Users/ADMIN/Desktop/Genbata Production/GentbetaProduction/GENBETA-FRONTEND"
npm run dev
```

Wait for: `Local: http://localhost:5173` ✅

### Step 3: Access Application
Open browser: `http://localhost:5173`

Login with Plant Admin credentials.

---

## Create Your First Approval Group

### Via UI (Recommended)

1. **Navigate to Approval Groups**
   ```
   Click: Plant Admin → Approval Groups
   URL: /plant/approval-groups
   ```

2. **Click "Create Group"**
   ```
   Top-right purple button
   ```

3. **Fill Form:**
   ```
   Group Name: Shift Engineers
   Description: Rotational shift coverage (optional)
   
   Select Members:
   ☑ Employee 1
   ☑ Employee 2
   ☑ Employee 3
   ```

4. **Click "Create Group"**
   ```
   Success toast: "Group created successfully"
   ```

---

## Use Group in Form Workflow

### Step 1: Create New Form
```
Plant Admin → Forms → Create Form
URL: /plant/forms/create/select
```

### Step 2: Add Approval Workflow
In form builder:
```
Scroll to: Approval Workflow section
Click: Add Level

Select Type: ● Group
Select Group: [Shift Engineers ▼]
Approval Mode: Any One Member
Name: Shift Engineer Approval
Description: First level approval by shift team
```

### Step 3: Publish Form
```
Click: Publish
Status changes to: PUBLISHED
```

---

## Test the Complete Flow

### Test Case 1: Submit Form
1. Login as Employee
2. Go to: `/employee/dashboard`
3. Find form assigned to you
4. Fill all fields
5. Click "Submit"
6. ✅ See success message

### Test Case 2: Approve as Group Member
1. Login as Aravind (group member)
2. Go to: `/employee/approval/pending`
3. Find the submitted form
4. Review data
5. Click "Approve"
6. Add comment: "Looks good"
7. Click "Submit"
8. ✅ See "Approved successfully"

### Test Case 3: Verify Duplicate Prevention
1. Login as Gnanavinith (another group member)
2. Go to: `/employee/approval/pending`
3. Find SAME form
4. Open details
5. ✅ See message: "Already approved by Aravind"
6. ✅ Approval buttons are DISABLED

---

## API Testing (For Developers)

### Get All Groups
```bash
curl http://localhost:5000/api/approval-groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "groupName": "Shift Engineers",
      "members": [...],
      "createdBy": {...}
    }
  ]
}
```

### Create Group via API
```bash
curl -X POST http://localhost:5000/api/approval-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "groupName": "QA Team",
    "description": "Quality assurance inspectors",
    "members": ["userId1", "userId2"]
  }'
```

---

## Common Issues & Solutions

### ❌ Issue: "Route not found"
**Solution:** Restart backend server
```bash
# Stop server (Ctrl+C)
# Restart
npm start
```

### ❌ Issue: "Access denied" when creating group
**Solution:** Ensure logged in as PLANT_ADMIN
```javascript
// Check in browser console
localStorage.getItem('user')
// Should show role: "PLANT_ADMIN"
```

### ❌ Issue: No employees in dropdown
**Solution:** Create employees first
```
Plant Admin → Employees → Add Employee
Create at least 2-3 employees
Then try creating group again
```

### ❌ Issue: Email not received
**Solution:** Check backend logs
```bash
# In backend terminal, look for:
"Email notification sent to..."
# If error, check .env email configuration
```

---

## Verification Checklist

After setup, verify these work:

- [ ] Can access `/plant/approval-groups` page
- [ ] Can see empty state or existing groups
- [ ] Can click "Create Group" button
- [ ] Modal opens with employee list
- [ ] Can select multiple employees
- [ ] Can save group successfully
- [ ] Group appears in list
- [ ] Can edit group
- [ ] Can delete group
- [ ] Can create form with group approver
- [ ] Employee can submit form
- [ ] Group member can approve
- [ ] Other members see "Already approved"
- [ ] Emails sent correctly

---

## Database Inspection

### View Groups in MongoDB
```javascript
// MongoDB Compass or CLI
use genbeta

// See all groups
db.approvalgroups.find({}).pretty()

// See specific group
db.approvalgroups.findOne({ groupName: "Shift Engineers" }).pretty()

// Count members
db.approvalgroups.aggregate([
  { $match: { groupName: "Shift Engineers" } },
  { $project: { memberCount: { $size: "$members" } } }
])
```

### View Form Approval Flow
```javascript
// See form with group approver
db.forms.findOne(
  { formName: "Your Form Name" },
  { formName: 1, approvalFlow: 1 }
).pretty()
```

### View Submission History
```javascript
// See approval history
db.formsubmissions.findOne(
  { formName: "Your Form Name" },
  { formName: 1, approvalHistory: 1, currentLevel: 1 }
).pretty()
```

---

## Performance Tips

### For Large Teams (50+ members per group)
- Enable pagination in API calls
- Use search/filter
- Consider lazy-loading member list

### For High Volume (1000+ submissions/day)
- Monitor database indexes
- Enable Redis caching (already configured)
- Check email service rate limits

---

## Security Notes

### Access Control
- Only PLANT_ADMIN can create/edit groups
- Group members only see their own groups
- Company isolation enforced (companyId check)
- Plant isolation enforced (plantId check)

### Data Validation
- Member count validated (min 1)
- User existence verified
- Plant membership checked
- Duplicate names prevented

---

## File Locations Cheat Sheet

```
Backend:
├── models/ApprovalGroup.model.js
├── controllers/approvalGroup.controller.js
├── routes/approvalGroup.routes.js
└── server.js (routes registered here)

Frontend:
├── api/approvalGroup.api.js
├── pages/plantAdmin/ApprovalGroupsPage.jsx
└── App.jsx (route added here)

Documentation:
├── GROUP_APPROVER_IMPLEMENTATION.md (detailed guide)
├── IMPLEMENTATION_SUMMARY.md (summary)
└── QUICK_START.md (this file)
```

---

## Next Steps After Testing

### Phase 1: Basic Usage
1. Create 2-3 test groups
2. Create form with group approver
3. Test complete approval flow
4. Verify duplicate prevention

### Phase 2: Production Rollout
1. Train Plant Admins on creating groups
2. Migrate existing forms to use groups where needed
3. Monitor email delivery
4. Collect user feedback

### Phase 3: Advanced Features (Future)
- ALL_REQUIRED approval mode
- Minimum quorum settings
- Group hierarchies
- Analytics dashboard

---

## Support Resources

### Documentation
- Full spec: `GROUP_APPROVER_IMPLEMENTATION.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`
- This guide: `QUICK_START.md`

### Logs
```bash
# Backend logs
pm2 logs backend

# Or view terminal output if running locally
```

### Database
```bash
# MongoDB connection string from .env
MONGO_URI=mongodb+srv://...
```

---

## 🎉 You're Ready!

Your Group Approver system is set up and ready to use!

**Happy approving! 🚀**

---

**Last Updated:** January 2025  
**Version:** 1.0.0
