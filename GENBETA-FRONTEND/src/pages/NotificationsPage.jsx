import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, Check, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../api/notification.api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'read'
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [token, activeTab]);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      const result = await notificationApi.markAsRead(id);
      if (result.success) {
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
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          </div>
        );
      case "error":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        </div>
        
        <p className="text-slate-600 mt-2">
          {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-4 font-medium text-sm ${
            activeTab === "all"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`pb-3 px-4 font-medium text-sm ${
            activeTab === "unread"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab("read")}
          className={`pb-3 px-4 font-medium text-sm ${
            activeTab === "read"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
          <p className="text-slate-500">
            {activeTab === "unread"
              ? "You have no unread notifications"
              : activeTab === "read"
              ? "You have no read notifications"
              : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-6 rounded-xl border ${
                notification.isRead
                  ? "bg-white border-slate-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {getNotificationIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        notification.isRead ? "text-slate-900" : "text-slate-900"
                      }`}>
                        {notification.title}
                      </h3>
                      <p className={`mt-2 text-slate-600 ${
                        notification.isRead ? "text-slate-600" : "text-slate-700"
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {notification.link && (
                    <button
                      onClick={() => navigate(notification.link)}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
                    >
                      View details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}