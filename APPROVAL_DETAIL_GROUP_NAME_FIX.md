# Group Approver Name Display Fix

## Issue
On the approval detail page (`/employee/approval/detail/:id`), group approvers were displaying as "Approver 1", "Approver 2", etc., instead of showing the actual group name (e.g., "Shift Engineering (Group)").

## Root Cause
The `approverNames` mapping function in `ApprovalDetail.jsx` only checked for individual approver names (`level.approverId.name`) but didn't handle GROUP type approvers which store the group name in `level.groupName` or `level.name`.

## Solution

### Updated File: `GENBETA-FRONTEND/src/pages/approval/ApprovalDetail.jsx`

**Lines 240-250:** Modified the `approverNames` mapping to check for GROUP type and display the group name:

```javascript
// BEFORE ❌
const approverNames = flow.map(level => {
  const approver = level.approverId;
  if (approver && typeof approver === "object" && approver.name) return approver.name;
  return `Approver ${level.level}`;
});

// AFTER ✅
const approverNames = flow.map(level => {
  // For GROUP type, show the group name if available
  if (level.type === "GROUP") {
    // Try multiple possible field names for the group name
    const groupName = level.groupName || level.name || "Approval Group";
    return `${groupName} (Group)`;
  }
  
  // For individual approvers
  const approver = level.approverId;
  if (approver && typeof approver === "object" && approver.name) return approver.name;
  return `Approver ${level.level}`;
});
```

## How It Works

### Data Flow:

1. **Form Creation/Editing** (Workflow Builder):
   - When a user selects a GROUP for an approval level
   - The workflow builder saves: `{ type: "GROUP", groupId: "...", name: "Shift Engineering" }`
   - The `name` field contains the group name at the time of creation

2. **Submission Display** (Approval Detail Page):
   - Fetches submission with populated form data
   - Form's `approvalFlow` array contains the workflow levels
   - Each level has either:
     - `type: "USER"` + `approverId` (with populated name/email)
     - `type: "GROUP"` + `groupId` + `name` (group name)

3. **Rendering**:
   - Maps through `flow` array
   - For GROUP levels: Displays `"{groupName} (Group)"`
   - For USER levels: Displays approver's name or fallback to "Approver X"

## Example Output

### Before Fix:
```
Approval Progress

Level 1 of 2
┌─────────────────────┐
│ 1                   │
│ Approver 1          │  ← ❌ Generic name
│ Awaiting decision   │
└─────────────────────┘
```

### After Fix:
```
Approval Progress

Level 1 of 2
┌─────────────────────┐
│ 1                   │
│ Shift Engineering   │  ← ✅ Actual group name
│ (Group)             │
│ Awaiting decision   │
└─────────────────────┘
```

## Fallback Strategy

The code uses a fallback chain to ensure a name is always displayed:

```javascript
const groupName = level.groupName || level.name || "Approval Group";
```

1. **First choice:** `level.groupName` - if explicitly stored
2. **Second choice:** `level.name` - most common, saved by workflow builder
3. **Last resort:** `"Approval Group"` - generic but better than "Approver 1"

## Related Components

This fix affects the approval progress section which displays:
- ✅ Current level indicator
- ✅ Completed/pending status for each level
- ✅ Approver names (now showing group names correctly)
- ✅ Status badges (Approved/Rejected/Pending)

## Testing

### Test Case 1: Group Approver Display
1. Create a form with a GROUP approver in the workflow
2. Submit the form as an employee
3. Navigate to `/employee/approval/detail/:submissionId`
4. **Expected:** Shows "Shift Engineering (Group)" or whatever the group name is

### Test Case 2: Individual Approver Display
1. Create a form with an individual approver
2. Submit the form
3. Navigate to approval detail
4. **Expected:** Shows the approver's full name (e.g., "John Doe")

### Test Case 3: Mixed Workflow
1. Create form with:
   - Level 1: GROUP (e.g., "Quality Team")
   - Level 2: Individual (e.g., "Plant Manager")
2. Submit form
3. Check approval detail
4. **Expected:** 
   - Level 1: "Quality Team (Group)"
   - Level 2: "Plant Manager" (or actual name)

## Backend Data Structure

The approvalFlow stored in the Form model:

```javascript
approvalFlow: [
  {
    level: 1,
    type: "GROUP",
    groupId: "69abc6dac38b76983e826c22",
    name: "Shift Engineering",  // ← This is what we display
    approvalMode: "ANY_ONE"
  },
  {
    level: 2,
    type: "USER",
    approverId: {
      _id: "69abc6dac38b76983e826c33",
      name: "John Doe",  // ← Populated by mongoose
      email: "john@example.com"
    }
  }
]
```

## Notes

- The group name is stored at the time of form creation/editing
- If a group is renamed after being assigned to a form, the OLD name will still show on existing submissions
- New submissions will use the updated group name from the form's approvalFlow
- This is intentional behavior to maintain historical accuracy

## Files Modified

- ✅ `GENBETA-FRONTEND/src/pages/approval/ApprovalDetail.jsx` (Lines 240-250)

## Related Files (No Changes Needed)

- `GENBETA-BACKEND/src/controllers/submission.controller.js` - Already returns approvalFlow with name field
- `GENBETA-BACKEND/src/models/Form.model.js` - Schema already supports name field
- `GENBETA-FRONTEND/src/components/forms/ModernFormBuilder/WorkflowBuilder.jsx` - Already saves name field
