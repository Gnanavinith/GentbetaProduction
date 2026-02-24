import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import FormSubmission from './src/models/FormSubmission.model.js';
import Form from './src/models/Form.model.js';
import User from './src/models/User.model.js';

dotenv.config();

async function testSubmission() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const submissionId = '699c716a8da7e97535147797';
    
    // Check if submission exists
    const submission = await FormSubmission.findById(submissionId)
      .populate('formId')
      .populate('submittedBy')
      .populate('approvedBy')
      .populate('rejectedBy');
    
    if (!submission) {
      console.log('❌ Submission not found');
      return;
    }
    
    console.log('✅ Submission found:');
    console.log('ID:', submission._id);
    console.log('Status:', submission.status);
    console.log('Current Level:', submission.currentLevel);
    console.log('Form Name:', submission.formId?.formName);
    console.log('Submitter:', submission.submittedBy?.name);
    console.log('Created At:', submission.createdAt);
    
    // Check approval flow
    if (submission.formId?.approvalFlow) {
      console.log('\n📋 Approval Flow:');
      submission.formId.approvalFlow.forEach((level, index) => {
        console.log(`Level ${index + 1}:`, level.approverId, level.name);
      });
    }
    
    // Check if form is populated
    console.log('\n📄 Form Data:');
    console.log('Form ID:', submission.formId?._id);
    console.log('Form Name:', submission.formId?.formName);
    console.log('Approval Flow Length:', submission.formId?.approvalFlow?.length || 0);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testSubmission();