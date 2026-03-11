import mongoose from "mongoose";

const approvalHistorySchema = new mongoose.Schema({
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  level: { type: Number, required: true },
  status: { type: String, enum: ["APPROVED", "REJECTED"], required: true },
  comments: String,
  actionedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["USER", "GROUP"], default: "USER" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalGroup" },
  groupName: String,
  isGroupApproval: { type: Boolean, default: false }
});

const formSubmissionSchema = new mongoose.Schema({
  // Core identifiers
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  formName: { type: String, required: true },

  // Submission metadata
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submittedByName: { type: String, required: true },
  submittedByEmail: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },

  // Data and status
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  files: [{
    fieldId: String,
    filename: String,
    originalName: String,
    url: String,
    mimetype: String,
    size: Number
  }],

  status: {
    type: String,
    enum: ["DRAFT", "SUBMITTED", "PENDING_APPROVAL", "APPROVED", "REJECTED"],
    default: "DRAFT"
  },

  // Approval workflow
  currentLevel: { type: Number, default: 0 },
  approvalHistory: [approvalHistorySchema],
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Organization context
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true },

  // Tracking
  numericalId: { type: Number, unique: true },
  readableId: { type: String, unique: true },
  isArchived: { type: Boolean, default: false }

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────

// Existing indexes
formSubmissionSchema.index({ formId: 1, status: 1 });
formSubmissionSchema.index({ submittedBy: 1 });
formSubmissionSchema.index({ companyId: 1, status: 1 });
formSubmissionSchema.index({ plantId: 1, status: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ submittedAt: -1 });
formSubmissionSchema.index({ currentLevel: 1, status: 1 });

// ✅ NEW: Compound indexes for frequently-queried combinations
// Used by getAssignedSubmissions — pending approvals at a specific level
formSubmissionSchema.index({ companyId: 1, status: 1, currentLevel: 1 });

// Used by submission history queries
formSubmissionSchema.index({ formId: 1, status: 1, createdAt: -1 });

// Used by plant-level pending approval dashboard queries
formSubmissionSchema.index({ plantId: 1, status: 1, currentLevel: 1 });

// Used by approval history page (filter by submittedBy + terminal statuses)
formSubmissionSchema.index({ submittedBy: 1, status: 1, updatedAt: -1 });

// Used by approvalHistory actor lookup (process approval authorization)
formSubmissionSchema.index({ "approvalHistory.approverId": 1 });

// Used by isArchived filter on list pages
formSubmissionSchema.index({ plantId: 1, isArchived: 1, status: 1 });

// ── Pre-save hooks ────────────────────────────────────────────────────────────

formSubmissionSchema.pre("save", async function (next) {
  // Auto-generate numerical ID
  if (!this.numericalId && this.isNew) {
    try {
      const FormSubmissionModel = mongoose.model("FormSubmission");
      const maxSubmission = await FormSubmissionModel.findOne({}, {}, { sort: { numericalId: -1 } }).lean();
      this.numericalId = maxSubmission?.numericalId ? maxSubmission.numericalId + 1 : 1000;
    } catch (err) {
      console.error("Error generating numerical ID:", err);
      this.numericalId = Date.now();
    }
  }

  // Generate readable ID
  if (!this.readableId && this.numericalId && this.formName) {
    try {
      const { generateReadableSubmissionId } = await import("../utils/formIdGenerator.js");
      this.readableId = generateReadableSubmissionId(this.formName, this.numericalId);
    } catch (err) {
      console.error("Error generating readable ID:", err);
      this.readableId = `submission-${this.numericalId}`;
    }
  }

  next();
});

export default mongoose.model("FormSubmission", formSubmissionSchema);