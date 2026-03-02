import mongoose from "mongoose";
import dotenv from "dotenv";
import FormSubmission from "../src/models/FormSubmission.model.js";
import User from "../src/models/User.model.js";

dotenv.config();

async function fixApprovalHistoryApproverId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all submissions with approval history entries that don't have approverId
    console.log("Finding submissions with incomplete approval history...");
    
    const submissions = await FormSubmission.find({
      "approvalHistory": { 
        $elemMatch: { 
          $or: [
            { "approverId": { $exists: false } },
            { "approverId": null }
          ]
        }
      }
    }).select("_id formName submittedBy approvalHistory");
    
    console.log(`Found ${submissions.length} submissions with incomplete approval history`);
    
    if (submissions.length === 0) {
      console.log("No incomplete approval history found. All good!");
      return;
    }
    
    // For each submission, try to infer approverId from other sources
    let fixedCount = 0;
    
    for (const submission of submissions) {
      console.log(`\nProcessing submission: ${submission.formName || submission._id}`);
      console.log(`Submitted by: ${submission.submittedBy}`);
      
      let submissionModified = false;
      
      // Try to fix each approval history entry
      for (let i = 0; i < submission.approvalHistory.length; i++) {
        const historyEntry = submission.approvalHistory[i];
        
        // Skip if approverId already exists
        if (historyEntry.approverId) {
          continue;
        }
        
        console.log(`  Fixing history entry ${i + 1} (level ${historyEntry.level}, status ${historyEntry.status})`);
        
        // Strategy 1: Try to find a user who matches the submission's plant/company and has approver role
        if (submission.submittedBy) {
          try {
            const submitter = await User.findById(submission.submittedBy);
            if (submitter) {
              // Look for users in the same plant/company who might be approvers
              const potentialApprovers = await User.find({
                $and: [
                  { _id: { $ne: submission.submittedBy } }, // Not the submitter
                  { isActive: true },
                  {
                    $or: [
                      { plantId: submitter.plantId },
                      { companyId: submitter.companyId }
                    ]
                  },
                  {
                    $or: [
                      { role: "PLANT_ADMIN" },
                      { role: "COMPANY_ADMIN" },
                      { role: "SUPER_ADMIN" }
                    ]
                  }
                ]
              }).select("_id name email role plantId companyId");
              
              if (potentialApprovers.length === 1) {
                // If there's only one potential approver, assume it's them
                historyEntry.approverId = potentialApprovers[0]._id;
                submissionModified = true;
                console.log(`    Assigned approver: ${potentialApprovers[0].name} (${potentialApprovers[0].email})`);
              } else if (potentialApprovers.length > 1) {
                console.log(`    Multiple potential approvers found (${potentialApprovers.length}), cannot auto-assign`);
                console.log(`    Options:`, potentialApprovers.map(u => `${u.name} (${u.email})`).join(", "));
              }
            }
          } catch (error) {
            console.log(`    Error looking up submitter: ${error.message}`);
          }
        }
        
        // Strategy 2: If we still can't determine approverId, use a placeholder
        if (!historyEntry.approverId) {
          // Use a special system user ID or mark as unknown
          historyEntry.approverId = new mongoose.Types.ObjectId("000000000000000000000000"); // Placeholder
          submissionModified = true;
          console.log(`    Used placeholder approverId for entry ${i + 1}`);
        }
      }
      
      // Save the submission if we made changes
      if (submissionModified) {
        try {
          await submission.save();
          fixedCount++;
          console.log(`  ✓ Saved fixes for submission ${submission._id}`);
        } catch (saveError) {
          console.log(`  ✗ Failed to save submission ${submission._id}: ${saveError.message}`);
        }
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total submissions checked: ${submissions.length}`);
    console.log(`Submissions fixed: ${fixedCount}`);
    console.log(`Submissions with unresolved issues: ${submissions.length - fixedCount}`);
    
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
fixApprovalHistoryApproverId();