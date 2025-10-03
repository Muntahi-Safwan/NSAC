import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  severity?: string;
  timestamp: Date;
  read: boolean;
  ngo?: {
    name: string;
    contactPhone?: string;
  };
  region?: string;
  isAlert?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  // Map severity to notification type
  const mapSeverityToType = (severity: string): 'info' | 'warning' | 'success' | 'error' => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }

    try {
      const response = await api.get(`/notifications/user/${user.id}`);

      if (response.data.success && response.data.data?.notifications) {
        const fetchedNotifications = response.data.data.notifications.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: mapSeverityToType(notif.severity),
          severity: notif.severity,
          timestamp: new Date(notif.createdAt),
          read: readNotifications.has(notif.id),
          ngo: notif.ngo,
          region: notif.region,
          isAlert: notif.isAlert
        }));

        setNotifications(fetchedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep existing notifications on error
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setReadNotifications((prev) => new Set(prev).add(id));
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setReadNotifications(new Set());
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
