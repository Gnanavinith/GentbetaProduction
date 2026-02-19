import mongoose from "mongoose";
import dotenv from "dotenv";
import Facility from "../src/models/Facility.model.js";
import FacilityTemplate from "../src/models/FacilityTemplate.model.js";

dotenv.config();

async function addApprovalEmailFlag() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all existing form fields to have includeInApprovalEmail: false by default
    console.log("Updating existing forms...");
    
    const formResult = await Facility.updateMany(
      { "fields.includeInApprovalEmail": { $exists: false } },
      { $set: { "fields.$[].includeInApprovalEmail": false } }
    );
    
    console.log(`Updated ${formResult.modifiedCount} forms`);

    const templateResult = await FacilityTemplate.updateMany(
      { "fields.includeInApprovalEmail": { $exists: false } },
      { $set: { "fields.$[].includeInApprovalEmail": false } }
    );
    
    console.log(`Updated ${templateResult.modifiedCount} form templates`);

    // Also update sections
    const sectionFacilityResult = await Facility.updateMany(
      { "sections.fields.includeInApprovalEmail": { $exists: false } },
      { $set: { "sections.$[].fields.$[].includeInApprovalEmail": false } }
    );
    
    console.log(`Updated ${sectionFacilityResult.modifiedCount} forms with section fields`);

    const sectionTemplateResult = await FacilityTemplate.updateMany(
      { "sections.fields.includeInApprovalEmail": { $exists: false } },
      { $set: { "sections.$[].fields.$[].includeInApprovalEmail": false } }
    );
    
    console.log(`Updated ${sectionTemplateResult.modifiedCount} form templates with section fields`);

    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
addApprovalEmailFlag();