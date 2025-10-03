import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: string;
  ngoName: string;
  region: string;
  createdAt: string;
  isAlert: boolean;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      fetchNotifications(user.id);
    }
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await axios.get(`https://nsac-mu.vercel.app/api/notifications/user/${userId}`);
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400/30 bg-red-500/10';
      case 'danger':
        return 'border-orange-400/30 bg-orange-500/10';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-500/10';
      default:
        return 'border-blue-400/30 bg-blue-500/10';
    }
  };

  const handleBellClick = () => {
    setShowPanel(!showPanel);
    if (!showPanel) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-white/70 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.1]">
            <h3 className="text-lg font-display font-bold text-white">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">No notifications</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-xl ${getSeverityColor(notification.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-white font-semibold text-sm">
                            {notification.title}
                          </h4>
                          {notification.isAlert && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-xs font-medium flex-shrink-0">
                              ALERT
                            </span>
                          )}
                        </div>
                        <p className="text-blue-200 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-300">{notification.ngoName}</span>
                          <span className="text-blue-300">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
