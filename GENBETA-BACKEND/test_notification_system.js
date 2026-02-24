import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createNotification } from './src/utils/notify.js';

dotenv.config();

async function testNotificationSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test notification creation
    const testUserId = '6989d3742d3502e3c89d6d90'; // Using existing user ID
    const testTitle = 'System Health Check';
    const testMessage = 'This is a test notification to verify the notification system is working';
    const testLink = '/dashboard';

    console.log('📝 Creating test notification...');
    const notification = await createNotification({
      userId: testUserId,
      title: testTitle,
      message: testMessage,
      link: testLink
    });

    if (notification) {
      console.log('✅ Notification created successfully!');
      console.log('📋 Notification details:');
      console.log(`   ID: ${notification._id}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Link: ${notification.link}`);
      console.log(`   Created: ${notification.createdAt}`);
      
      // Clean up the test notification
      await mongoose.model('Notification').findByIdAndDelete(notification._id);
      console.log('🧹 Test notification cleaned up');
    } else {
      console.log('❌ Failed to create notification');
    }

  } catch (error) {
    console.error('💥 Error in notification system test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Running notification system test...\n');
testNotificationSystem();