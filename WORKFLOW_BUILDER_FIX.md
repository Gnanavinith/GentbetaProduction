# WorkflowBuilder Group Approval Update

## ✅ Fixed: Group Approval Option Now Available on `/plant/forms/:id/edit/workflow`

### Problem
The edit workflow page was using `WorkflowBuilder.jsx` component which didn't have group approval support. Only the main FormBuilder had been updated.

### Solution
Updated `GENBETA-FRONTEND/src/components/forms/ModernFormBuilder/WorkflowBuilder.jsx` to include full group approval functionality.

---

## 🎯 What Changed

### 1. **Added Imports**
```javascript
import { Users } from "lucide-react";
import { approvalGroupApi } from "../../../api/approvalGroup.api";
```

### 2. **Added State**
```javascript
const [approvalGroups, setApprovalGroups] = useState([]);
```

### 3. **Added API Call**
```javascript
const fetchApprovalGroups = async () => {
  try {
    const res = await approvalGroupApi.getGroups();
    if (res.success && Array.isArray(res.data)) {
      setApprovalGroups(res.data);
    }
  } catch (err) {
    console.error("Error fetching approval groups:", err);
  }
};
```

### 4. **Enhanced Level Structure**
Each approval level now includes:
```javascript
{
  id: "level-123456",
  name: "Approval Level 1",
  type: "USER",        // NEW: "USER" or "GROUP"
  approverId: "",      // For USER type
  groupId: "",         // For GROUP type
  approvalMode: "ANY_ONE", // For GROUP type
  description: "..."
}
```

### 5. **New UI Components**

#### Type Selector
- Dropdown to choose between "Individual" and "Group"
- Automatically clears incompatible fields when switching

#### Conditional Approver/Group Selector
- Shows employee list for "Individual"
- Shows group list with member count for "Group"
- Auto-updates level name when group is selected

#### Approval Mode (Group Only)
- Displays in highlighted indigo box
- Currently supports "ANY_ONE" mode
- Includes helper text explaining behavior

---

## 🎨 Visual Layout

```
╔═══════════════════════════════════════════════╗
║  🛡️ Approval Workflow          [+1][+2][+3]  ║
╠═══════════════════════════════════════════════╣
║  ┌───────────────────────────────────────┐   ║
║  │ 1. Engineering Manager Approval   [🗑] │   ║
║  │                                       │   ║
║  │ Approver Type:                        │   ║
║  │ [Group ▼]                            │   ║
║  │                                       │   ║
║  │ Select Group:                         │   ║
║  │ [Shift Engineering (3) ▼]            │   ║
║  │                                       │   ║
║  │ Description / Rule:                   │   ║
║  │ [All shift handover approvals]        │   ║
║  │                                       │   ║
║  │ ┌──────────────────────────────────┐  │   ║
║  │ │ 👥 Approval Mode                 │  │   ║
║  │ │ [Any One Member Can Approve ▼]   │  │   ║
║  │ │ When any member approves...      │  │   ║
║  │ └──────────────────────────────────┘  │   ║
║  └───────────────────────────────────────┘   ║
║                                              ║
║  [+ Add Approval Level]                      ║
╚══════════════════════════════════════════════╝
```

---

## ✨ Features

### ✅ Individual Approver
1. Select "Individual" from type dropdown
2. Choose employee from list
3. Add description/rule
4. Save workflow

### ✅ Group Approver
1. Select "Group" from type dropdown
2. Choose group (shows member count)
3. Level name auto-updates to group name
4. Approval mode section appears
5. "ANY_ONE" mode enabled by default
6. Add description/rule
7. Save workflow

### ✅ Smart Field Clearing
When switching types:
- USER → GROUP: Clears `approverId`
- GROUP → USER: Clears `groupId`
- Prevents data conflicts

### ✅ Member Count Display
Shows real-time group size:
```
Shift Engineering (3 members)
Night Shift Ops (5 members)
```

---

## 🔧 How It Works

### 1. **Component Initialization**
```javascript
useEffect(() => {
  if (user?.plantId) {
    fetchEmployees();      // Load individual approvers
    fetchApprovalGroups(); // Load approval groups
  }
}, [user]);
```

### 2. **Adding New Level**
```javascript
const addLevel = () => {
  setWorkflow(prev => [...prev, {
    id: `level-${Date.now()}`,
    name: `Approval Level ${prev.length + 1}`,
    type: "USER",           // Default to individual
    approverId: "",
    groupId: "",
    approvalMode: "ANY_ONE",
    description: "Standard approval required"
  }]);
};
```

### 3. **Type Switching Logic**
```javascript
onChange={(e) => {
  const newType = e.target.value;
  updateLevel(level.id, { 
    type: newType,
    approverId: newType === "GROUP" ? "" : level.approverId,
    groupId: newType === "USER" ? "" : level.groupId
  });
}}
```

### 4. **Group Selection**
```javascript
onChange={(e) => {
  const selectedGroup = approvalGroups.find(g => g._id === e.target.value);
  updateLevel(level.id, { 
    groupId: e.target.value,
    name: selectedGroup ? selectedGroup.groupName : level.name
  });
}}
```

---

## 📊 Data Flow

### Frontend → Backend
```javascript
// When saving form workflow
{
  approvalFlow: [
    {
      level: 1,
      type: "GROUP",
      groupId: "69abc6dac38b76983e826c22",
      approvalMode: "ANY_ONE",
      name: "Shift Engineering",
      description: "All shift handover approvals"
    },
    {
      level: 2,
      type: "USER",
      approverId: "69abc6dac38b76983e826c33",
      name: "Plant Manager",
      description: "Final approval"
    }
  ]
}
```

### Backend Storage
Stored in `Form.model.js`:
```javascript
approvalFlow: [{
  level: Number,
  type: { type: String, enum: ["USER", "GROUP"], default: "USER" },
  approverId: ObjectId,  // Required if type === "USER"
  groupId: ObjectId,     // Required if type === "GROUP"
  approvalMode: { type: String, enum: ["ANY_ONE", "ALL_REQUIRED"] },
  name: String,
  description: String
}]
```

---

## 🧪 Testing Steps

### Test 1: Create Individual Approver
1. Go to http://localhost:5173/plant/forms/69abc6dac38b76983e826c22/edit/workflow
2. Click "+ Add Approval Level"
3. Leave type as "Individual"
4. Select an employee
5. Add description
6. Click Save
7. ✅ Verify: Saves successfully with `type: "USER"`

### Test 2: Create Group Approver
1. On same page, add another level
2. Change type to "Group"
3. Select a group from dropdown
4. Notice level name auto-updates
5. See approval mode section appear
6. Add description
7. Click Save
8. ✅ Verify: Saves with `type: "GROUP"`, `groupId`, `approvalMode: "ANY_ONE"`

### Test 3: Switch Types
1. Create a level with "Individual" selected
2. Switch to "Group"
3. ✅ Verify: `approverId` cleared
4. Switch back to "Individual"
5. ✅ Verify: `groupId` cleared

### Test 4: Member Count Display
1. Open group dropdown
2. ✅ Verify: Each group shows member count
   - "Shift Engineering (3 members)"
   - "Night Shift Ops (5 members)"

---

## 🎯 Comparison: Before vs After

### BEFORE ❌
```
┌─────────────────────────────┐
│ Approver:                   │
│ [Select approver ▼]         │
│                             │
│ Description:                │
│ [Enter rule]                │
└─────────────────────────────┘
```
- Only individual approvers supported
- No group option visible
- Limited flexibility

### AFTER ✅
```
┌─────────────────────────────┐
│ Approver Type:              │
│ [Individual ▼] or [Group ▼]│
│                             │
│ Select Approver/Group:      │
│ [Dynamic dropdown ▼]        │
│                             │
│ Description:                │
│ [Enter rule]                │
│                             │
│ [👥 Approval Mode]          │
│ [Any One ▼]                 │
│ (Shows only for Group)      │
└─────────────────────────────┘
```
- Both individual and group supported
- Dynamic UI based on selection
- Clear visual feedback
- Approval mode configuration

---

## 🔗 Integration Points

### Uses Existing APIs
- `approvalGroupApi.getGroups()` - Fetches all active groups
- `userApi.getPlantEmployees()` - Fetches plant employees

### Compatible With
- Form model schema (already supports `type`, `groupId`, `approvalMode`)
- Submission controller (already handles group validation)
- Approval processing logic (already checks `type === "GROUP"`)

### No Breaking Changes
- Old forms without `type` field default to `"USER"`
- Existing workflows continue working
- Backward compatible

---

## 📝 Files Modified

1. **GENBETA-FRONTEND/src/components/forms/ModernFormBuilder/WorkflowBuilder.jsx**
   - Added group approval UI
   - Added type selector
   - Added conditional rendering
   - Added approval mode display
   - Enhanced data structure

---

## ✅ Complete Feature Set

### Sidebar ✅
- "Approval Groups" menu item added
- ShieldCheck icon
- Plant Admin role only

### Approval Groups Page ✅
- Full CRUD operations
- Member management
- Search and filter
- Statistics dashboard

### Form Builder ✅
- Type selector (Individual/Group)
- Group dropdown with member count
- Approval mode selector
- Smart field clearing

### Workflow Builder ✅ (FIXED)
- All features from Form Builder
- Same UI components
- Same data structure
- Same backend integration

### Backend ✅
- Models updated
- Controllers enhanced
- Routes configured
- Validation logic ready

---

## 🎉 Result

Now both form builder interfaces support group approvers:
1. ✅ Main form builder (`/plant/forms/create`)
2. ✅ Workflow editor (`/plant/forms/:id/edit/workflow`)

**You can now configure group approvals on the workflow edit page!** 🚀
