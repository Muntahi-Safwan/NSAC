import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '../services/pushNotification.service';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, body: string, options?: any) => Promise<Notification | null>;
  sendHazardAlert: (level: 'critical' | 'danger' | 'warning', message: string, data?: any) => Promise<Notification | null>;
  sendAQIAlert: (aqi: number, location: string, threshold: number) => Promise<Notification | null>;
  sendTestNotification: () => Promise<Notification | null>;
}

/**
 * Custom hook for managing push notifications
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setIsSupported(pushNotificationService.isNotificationSupported());
    setPermission(pushNotificationService.getPermissionStatus());
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await pushNotificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(async (title: string, body: string, options?: any): Promise<Notification | null> => {
    return pushNotificationService.sendNotification({
      title,
      body,
      ...options,
    });
  }, []);

  const sendHazardAlert = useCallback(async (
    level: 'critical' | 'danger' | 'warning',
    message: string,
    data?: any
  ): Promise<Notification | null> => {
    return pushNotificationService.sendHazardAlert(level, message, data);
  }, []);

  const sendAQIAlert = useCallback(async (
    aqi: number,
    location: string,
    threshold: number
  ): Promise<Notification | null> => {
    return pushNotificationService.sendAQIAlert(aqi, location, threshold);
  }, []);

  const sendTestNotification = useCallback(async (): Promise<Notification | null> => {
    return pushNotificationService.sendTestNotification();
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendHazardAlert,
    sendAQIAlert,
    sendTestNotification,
  };
};

export default usePushNotifications;
