import express from "express";
import { 
  getNotifications, 
  markAsRead,
  createNotification
} from "../controllers/notification.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { enforcePlanLimits } from "../middlewares/planEnforcement.middleware.js";

const router = express.Router();

// Get all notifications for the current user
router.get("/", auth, getNotifications);

// Mark a notification as read
router.put("/:id/read", auth, markAsRead);

// Create a notification (for internal system use - may require additional auth)
// Note: This is primarily for internal use by system components
router.post("/", auth, enforcePlanLimits("notification"), createNotification);

export default router;