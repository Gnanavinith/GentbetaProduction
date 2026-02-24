import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createNotification } from './src/utils/notify.js';

dotenv.config();

async function testNotificationPrevention() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const testUserId = '6989d3742d3502e3c89d6d90'; // Using existing user ID
    const testTitle = 'Test Duplicate Prevention';
    const testMessage = 'This is a test message to check duplicate prevention';
    const testLink = '/test';
    
    console.log('Creating first notification...');
    const notification1 = await createNotification({
      userId: testUserId,
      title: testTitle,
      message: testMessage,
      link: testLink
    });
    
    console.log('Creating duplicate notification...');
    const notification2 = await createNotification({
      userId: testUserId,
      title: testTitle,
      message: testMessage,
      link: testLink
    });
    
    console.log('First notification ID:', notification1?._id);
    console.log('Second notification ID:', notification2?._id);
    console.log('Are they the same?', notification1?._id?.toString() === notification2?._id?.toString());
    
    // Clean up test notification
    if (notification1) {
      await mongoose.model('Notification').findByIdAndDelete(notification1._id);
      console.log('Test notification cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testNotificationPrevention();