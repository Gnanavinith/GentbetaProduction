import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

export const createNotification = async ({ userId, title, message, link }) => {
  try {
    // Get user to find plantId and companyId
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found for notification: ${userId}`);
      return null;
    }
    
    // Log notification creation
    console.log(`System notification created for plant ${user.plantId}`);
    
    // Check if a similar notification already exists for this user
    const existingNotification = await Notification.findOne({
      userId,
      title,
      message
    });
    
    // If notification already exists, don't create a duplicate
    if (existingNotification) {
      console.log(`Duplicate notification prevented for user ${userId}: ${title} - ${message}`);
      return existingNotification;
    }
    
    // Create new notification
    const notification = await Notification.create({ userId, title, message, link });
    console.log(`Notification created for user ${userId}: ${title} - ${message} with ID: ${notification._id}`);
    return notification;
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.log(`Database-level duplicate prevented for user ${userId}: ${title} - ${message}`);
      // Try to find and return the existing notification
      try {
        const existing = await Notification.findOne({ userId, title, message });
        return existing;
      } catch (findError) {
        console.error("Error finding existing notification:", findError);
        return null;
      }
    }
    console.error("Error creating notification:", error);
    console.error("Error details - userId:", userId, "title:", title, "message:", message);
    return null;
  }
};