// Push Notification Service for Browser Notifications
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

class PushNotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Check if notifications are supported in the browser
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Send a push notification
   */
  async sendNotification(payload: NotificationPayload): Promise<Notification | null> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported');
      return null;
    }

    // Request permission if not already granted
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }
    }

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/logo.png',
        tag: payload.tag || 'air-quality-alert',
        data: payload.data,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
      };

      // Add vibrate if supported
      if (payload.vibrate && 'vibrate' in navigator) {
        (options as any).vibrate = payload.vibrate;
      }

      const notification = new Notification(payload.title, options);

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // Navigate to relevant page if data is provided
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Send critical hazard alert
   */
  async sendHazardAlert(level: 'critical' | 'danger' | 'warning', message: string, data?: any): Promise<Notification | null> {
    const icons: Record<string, string> = {
      critical: '🚨',
      danger: '⚠️',
      warning: '⚡',
    };

    const titles: Record<string, string> = {
      critical: 'CRITICAL AIR QUALITY ALERT',
      danger: 'DANGER: Air Quality Alert',
      warning: 'WARNING: Air Quality Alert',
    };

    const vibrationPatterns: Record<string, number[]> = {
      critical: [200, 100, 200, 100, 200, 100, 200],
      danger: [200, 100, 200, 100, 200],
      warning: [200, 100, 200],
    };

    return this.sendNotification({
      title: `${icons[level]} ${titles[level]}`,
      body: message,
      tag: `hazard-${level}-${Date.now()}`,
      requireInteraction: level === 'critical' || level === 'danger',
      vibrate: vibrationPatterns[level],
      data: {
        level,
        timestamp: new Date().toISOString(),
        ...data,
      },
    });
  }

  /**
   * Send AQI threshold alert
   */
  async sendAQIAlert(aqi: number, location: string, threshold: number): Promise<Notification | null> {
    let level: 'critical' | 'danger' | 'warning';
    let icon: string;
    let message: string;

    if (aqi >= 200) {
      level = 'critical';
      icon = '🚨';
      message = `CRITICAL: AQI in ${location} has reached ${aqi}! Hazardous air quality. Stay indoors immediately.`;
    } else if (aqi >= 150) {
      level = 'danger';
      icon = '⚠️';
      message = `DANGER: AQI in ${location} is ${aqi}. Unhealthy air quality. Limit outdoor activities.`;
    } else {
      level = 'warning';
      icon = '⚡';
      message = `WARNING: AQI in ${location} is ${aqi}. Air quality is declining.`;
    }

    return this.sendHazardAlert(level, message, {
      aqi,
      location,
      threshold,
      url: '/map',
    });
  }

  /**
   * Send health recommendation notification
   */
  async sendHealthRecommendation(message: string): Promise<Notification | null> {
    return this.sendNotification({
      title: '💊 Health Recommendation',
      body: message,
      tag: 'health-recommendation',
      requireInteraction: false,
      vibrate: [100, 50, 100],
    });
  }

  /**
   * Send emergency contact notification
   */
  async sendEmergencyContact(message: string): Promise<Notification | null> {
    return this.sendNotification({
      title: '📱 Emergency Contacts Available',
      body: message,
      tag: 'emergency-contact',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
    });
  }

  /**
   * Close all notifications with a specific tag
   */
  closeNotificationsByTag(tag: string): void {
    // Note: This is limited in browsers. Notifications auto-close after a timeout.
    console.log(`Closing notifications with tag: ${tag}`);
  }

  /**
   * Test notification (for debugging)
   */
  async sendTestNotification(): Promise<Notification | null> {
    return this.sendNotification({
      title: '✅ Test Notification',
      body: 'Push notifications are working correctly!',
      tag: 'test-notification',
      requireInteraction: false,
    });
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
