import mongoose from "mongoose";

const approvalGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────

// Existing indexes
approvalGroupSchema.index({ companyId: 1, plantId: 1, isActive: 1 });
approvalGroupSchema.index({ members: 1 });
approvalGroupSchema.index({ groupName: 1 });

// ✅ NEW: Compound index for the most common query pattern:
// "find active groups that this user is a member of"
// Used heavily in getAssignedSubmissions
approvalGroupSchema.index({ members: 1, isActive: 1 });

// ✅ NEW: Compound for plant-scoped active group lookups
approvalGroupSchema.index({ plantId: 1, isActive: 1, members: 1 });

export default mongoose.model("ApprovalGroup", approvalGroupSchema);