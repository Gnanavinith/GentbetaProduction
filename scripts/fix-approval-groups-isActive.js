// Migration Script: Add isActive field to existing Approval Groups
// Run this ONCE in your MongoDB environment

// Method 1: Run directly in MongoDB shell
db.approvalgroups.updateMany(
  { isActive: { $exists: false } },
  { $set: { isActive: true } }
);

// Method 2: Run as Node.js script (if you prefer)
// Save this file as fix-approval-groups-isActive.js and run with:
// node scripts/fix-approval-groups-isActive.js

const mongoose = require('mongoose');

async function fixApprovalGroupsIsActive() {
  try {
    // Connect to your MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genbata';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    const ApprovalGroup = mongoose.model('ApprovalGroup', new mongoose.Schema({
      groupName: String,
      description: String,
      members: [mongoose.Schema.Types.ObjectId],
      companyId: mongoose.Schema.Types.ObjectId,
      plantId: mongoose.Schema.Types.ObjectId,
      createdBy: mongoose.Schema.Types.ObjectId,
      isActive: Boolean,
      createdAt: Date,
      updatedAt: Date
    }, { timestamps: true }), 'approvalgroups');
    
    // Update all documents missing isActive field
    const result = await ApprovalGroup.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} approval groups`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}`);
    
    // Verify the fix
    const count = await ApprovalGroup.countDocuments({ isActive: true });
    console.log(`\n✅ Total active approval groups: ${count}`);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

// Run the migration
fixApprovalGroupsIsActive();
