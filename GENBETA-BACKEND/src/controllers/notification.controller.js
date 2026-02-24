import Notification from "../models/Notification.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.find({userId: req.user.userId}).sort({createdAt:-1});
    res.json(data);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {isRead: true});
    res.json({success: true});
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark notification as read" 
    });
  }
};

// Create a new notification (internal use by system)
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, link } = req.body;

    const notification = await Notification.create({
      userId,
      title,
      message,
      link,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create notification" 
    });
  }
};