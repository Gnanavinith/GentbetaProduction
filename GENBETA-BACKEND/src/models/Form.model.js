import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: [
        "text", "email", "number", "phone", "radio", "checkbox", "file", "date", "datetime", "range", "color", "table", "textarea", "dropdown", "multi-select", "multiselect", "signature", "section-divider",
        "checklist-row", "checklist", "grid-table", "image", "terms", "auto-date", "auto-user", "daterange"
      ]
    },

  required: { type: Boolean, default: false },
  options: [String], // For radio, checkbox, dropdown, multi-select

  // Layout & Styling
  width: { type: String, default: "100%" },
  alignment: { type: String, default: "left" },

  // Checklist & Table Specific
  question: String,
  rowHeight: { type: String, default: "auto" },
  columns: [{ 
    id: String, 
    label: String, 
    width: String 
  }],
  rows: { type: Number, default: 0 },
  repeatable: { type: Boolean, default: false },
  items: [{ 
    id: String, 
    question: String 
  }],

  // Content & Special
  content: String,
  height: String, // For spacer
  maxFileSize: { type: Number, default: 5 },

  format: String, // For auto-date format

  // Additional field properties
  placeholder: String,
  min: Number, // For number, range
  max: Number, // For number, range
  step: Number, // For number, range
  
  // Approval Email Control
  includeInApprovalEmail: { type: Boolean, default: false }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  fields: [fieldSchema]
}, { _id: false });

const formSchema = new mongoose.Schema({
  formId: { type: String, unique: true, required: true },
  numericalId: { type: Number, unique: true, sparse: true },
  formName: { type: String, required: true },
  description: String,
  sections: [sectionSchema], // Hierarchical structure
  fields: [fieldSchema], // Keeping top-level fields for legacy/simple forms
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant" },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ["DRAFT", "IN_APPROVAL", "APPROVED", "REJECTED", "PUBLISHED"], default: "DRAFT" },
      isTemplate: { type: Boolean, default: false },
      approvalTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalTask" },
    approvalFlow: [{
      level: { type: Number, required: true },
      // Support for both individual and group approvers
      type: { 
        type: String, 
        enum: ["USER", "GROUP"], 
        default: "USER" 
      },
      approverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        validate: {
          validator: function(v) {
            // If type is USER, approverId must be provided (not null, undefined, or empty string)
            if (this.type === "USER") {
              return v != null && v !== "";
            }
            // For GROUP type, approverId should be null/undefined/empty
            return true;
          },
          message: 'approverId is required when type is USER'
        },
        required: function() {
          return this.type === "USER";
        }
      },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApprovalGroup",
        validate: {
          validator: function(v) {
            // If type is GROUP, groupId must be provided (not null, undefined, or empty string)
            if (this.type === "GROUP") {
              return v != null && v !== "";
            }
            // For USER type, groupId should be null/undefined/empty
            return true;
          },
          message: 'groupId is required when type is GROUP'
        },
        required: function() {
          return this.type === "GROUP";
        }
      },
      // Approval mode for groups
      approvalMode: {
        type: String,
        enum: ["ANY_ONE", "ALL_REQUIRED"],
        default: "ANY_ONE"
      },
      name: String,
      description: String
    }]
  }, { timestamps: true });

// Add indexes for better query performance
formSchema.index({ companyId: 1, isActive: 1 });
formSchema.index({ plantId: 1, isActive: 1 });
formSchema.index({ status: 1 });
formSchema.index({ isTemplate: 1 });
formSchema.index({ createdAt: -1 });
formSchema.index({ companyId: 1, status: 1 });
formSchema.index({ plantId: 1, status: 1 });

// Generate numerical ID before saving
formSchema.pre('save', async function(next) {
  if (!this.numericalId && this.isNew) {
    try {
      const FormModel = mongoose.model('Form');
      const maxForm = await FormModel.findOne().sort({ numericalId: -1 });
      this.numericalId = maxForm && maxForm.numericalId ? maxForm.numericalId + 1 : 1;
    } catch (err) {
      console.error('Error generating numerical ID:', err);
      this.numericalId = Date.now(); // Fallback
    }
  }
  next();
});

export default mongoose.model("Form", formSchema);