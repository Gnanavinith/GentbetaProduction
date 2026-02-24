import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../api/notification.api";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    const fetchAndShowNotifications = async () => {
      if (!token) return;

      try {
        const data = await notificationApi.getNotifications();
        setNotifications(data);

        // Removed toast notifications - only update the notification list
        // Toast notifications were removed as requested
        // Cleaned up unused window.lastNotification reference
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial load
    fetchAndShowNotifications();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchAndShowNotifications, 10000);

    return () => clearInterval(interval);
  }, [token]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Load notifications when opening
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      const result = await notificationApi.markAsRead(id);
      if (result.success) {
        // Update local state
        setNotifications(notifications.map(notification =>
          notification._id === id ? { ...notification, isRead: true } : notification
        ));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        );
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-slate-50 transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-slate-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-600 mt-1 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {formatDate(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium ml-2"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          aria-label="Mark as read"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications"); // Navigate to notifications page
                }}
                className="w-full py-2 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}