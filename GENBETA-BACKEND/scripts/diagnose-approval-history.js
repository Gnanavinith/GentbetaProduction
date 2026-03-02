import mongoose from "mongoose";
import dotenv from "dotenv";
import FormSubmission from "../src/models/FormSubmission.model.js";

dotenv.config();

async function diagnoseApprovalHistory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get a sample of submissions with approval history
    console.log("Fetching sample submissions with approval history...");
    
    const submissions = await FormSubmission.find({
      "approvalHistory.0": { $exists: true } // Has at least one history entry
    })
    .limit(5)
    .select("_id formName submittedBy approvalHistory");
    
    console.log(`Found ${submissions.length} sample submissions with approval history\n`);
    
    submissions.forEach((submission, index) => {
      console.log(`=== Submission ${index + 1}: ${submission.formName || submission._id} ===`);
      console.log(`Submitted by: ${submission.submittedBy}`);
      console.log(`Approval History Entries: ${submission.approvalHistory.length}`);
      
      submission.approvalHistory.forEach((entry, i) => {
        console.log(`  Entry ${i + 1}:`);
        console.log(`    Level: ${entry.level}`);
        console.log(`    Status: ${entry.status}`);
        console.log(`    ApproverId: ${entry.approverId || 'MISSING'}`);
        console.log(`    ActionedAt: ${entry.actionedAt}`);
        console.log(`    Comments: ${entry.comments || 'None'}`);
        console.log(`    Full entry:`, JSON.stringify(entry, null, 2));
      });
      console.log();
    });
    
    // Check for submissions with missing approverId
    console.log("=== Checking for missing approverId ===");
    const incompleteSubmissions = await FormSubmission.find({
      "approvalHistory": { 
        $elemMatch: { 
          $or: [
            { "approverId": { $exists: false } },
            { "approverId": null }
          ]
        }
      }
    }).count();
    
    console.log(`Submissions with missing approverId: ${incompleteSubmissions}`);
    
    // Check total submissions with approval history
    const totalWithHistory = await FormSubmission.count({
      "approvalHistory.0": { $exists: true }
    });
    
    console.log(`Total submissions with approval history: ${totalWithHistory}`);
    console.log(`Healthy entries: ${totalWithHistory - incompleteSubmissions}`);
    
  } catch (error) {
    console.error("Diagnosis error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the diagnosis
diagnoseApprovalHistory();