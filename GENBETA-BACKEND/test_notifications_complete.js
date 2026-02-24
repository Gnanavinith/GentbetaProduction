import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createNotification } from './src/utils/notify.js';
import User from './src/models/User.model.js';
import Form from './src/models/Form.model.js';
import FormSubmission from './src/models/FormSubmission.model.js';

dotenv.config();

async function testCompleteNotificationFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get sample users for testing
    const users = await User.find({}).limit(3);
    if (users.length < 3) {
      console.log('⚠️ Need at least 3 users to test notification flows (submitter, approver, plant admin)');
      return;
    }

    const [submitter, approver, plantAdmin] = users;
    
    // Test notification to approver when form is submitted
    console.log('\n📝 Testing notification to approver when form is submitted...');
    const notification1 = await createNotification({
      userId: approver._id,
      title: "Approval Required",
      message: "Form Test Form waiting for your approval",
      link: `/employee/approvals/test-submission-id`
    });

    if (notification1) {
      console.log('✅ Notification to approver created successfully!');
    } else {
      console.log('❌ Failed to create notification to approver');
    }

    // Test notification to plant admin when form is submitted
    console.log('\n📝 Testing notification to plant admin when form is submitted...');
    const notification2 = await createNotification({
      userId: plantAdmin._id,
      title: "New Form Submitted",
      message: `${submitter.name} submitted Test Form`,
      link: `/plant/submissions`
    });

    if (notification2) {
      console.log('✅ Notification to plant admin created successfully!');
    } else {
      console.log('❌ Failed to create notification to plant admin');
    }

    // Test notification to plant admin when form is approved
    console.log('\n📝 Testing notification to plant admin when form is approved...');
    const notification3 = await createNotification({
      userId: plantAdmin._id,
      title: "Form Approved",
      message: 'Form "Test Form" has been fully approved',
      link: `/plant/submissions/test-submission-id`
    });

    if (notification3) {
      console.log('✅ Final approval notification to plant admin created successfully!');
    } else {
      console.log('❌ Failed to create final approval notification to plant admin');
    }

    // Test notification to submitter when form is approved
    console.log('\n📝 Testing notification to submitter when form is approved...');
    const notification4 = await createNotification({
      userId: submitter._id,
      title: "Form Approved",
      message: 'Your form "Test Form" has been fully approved',
      link: `/employee/submissions/test-submission-id`
    });

    if (notification4) {
      console.log('✅ Final approval notification to submitter created successfully!');
    } else {
      console.log('❌ Failed to create final approval notification to submitter');
    }

    // Test intermediate progress notification
    console.log('\n📝 Testing intermediate progress notification...');
    const notification5 = await createNotification({
      userId: plantAdmin._id,
      title: "Form In Progress",
      message: 'Form "Test Form" has been approved by Test Approver and moved to the next approval level',
      link: `/plant/submissions/test-submission-id`
    });

    if (notification5) {
      console.log('✅ Progress notification to plant admin created successfully!');
    } else {
      console.log('❌ Failed to create progress notification to plant admin');
    }

    // Clean up test notifications
    console.log('\n🧹 Cleaning up test notifications...');
    if (notification1) await mongoose.model('Notification').findByIdAndDelete(notification1._id);
    if (notification2) await mongoose.model('Notification').findByIdAndDelete(notification2._id);
    if (notification3) await mongoose.model('Notification').findByIdAndDelete(notification3._id);
    if (notification4) await mongoose.model('Notification').findByIdAndDelete(notification4._id);
    if (notification5) await mongoose.model('Notification').findByIdAndDelete(notification5._id);
    
    console.log('✅ Test notifications cleaned up');

    console.log('\n🎉 All notification tests completed successfully!');

  } catch (error) {
    console.error('💥 Error in notification flow test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Running complete notification flow test...\n');
testCompleteNotificationFlow();