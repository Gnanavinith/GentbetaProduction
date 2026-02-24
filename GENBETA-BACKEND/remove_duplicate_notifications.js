import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './src/models/Notification.model.js';

dotenv.config();

async function removeDuplicateNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find all "Form Approved" notifications
    const approvedNotifications = await Notification.find({
      title: "Form Approved"
    }).sort({ createdAt: 1 });
    
    console.log(`Found ${approvedNotifications.length} "Form Approved" notifications`);
    
    // Group by userId and message to find duplicates
    const grouped = {};
    
    approvedNotifications.forEach(notification => {
      const key = `${notification.userId}-${notification.message}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push({
        id: notification._id,
        createdAt: notification.createdAt
      });
    });
    
    // Remove duplicates (keep only the first one)
    let removedCount = 0;
    
    for (const key in grouped) {
      const notifications = grouped[key];
      if (notifications.length > 1) {
        // Keep the first notification, remove the rest
        const idsToRemove = notifications.slice(1).map(n => n.id);
        await Notification.deleteMany({ _id: { $in: idsToRemove } });
        removedCount += idsToRemove.length;
        console.log(`Removed ${idsToRemove.length} duplicates for key: ${key}`);
      }
    }
    
    console.log(`\nTotal duplicates removed: ${removedCount}`);
    
    // Verify cleanup
    const remainingCount = await Notification.countDocuments({ title: "Form Approved" });
    console.log(`Remaining "Form Approved" notifications: ${remainingCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

removeDuplicateNotifications();