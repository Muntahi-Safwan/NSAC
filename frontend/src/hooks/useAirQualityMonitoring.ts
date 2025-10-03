import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

interface AirQualityMonitoringOptions {
  location: string;
  currentAQI: number;
  thresholds?: {
    warning?: number;
    danger?: number;
    critical?: number;
  };
  enabled?: boolean;
}

/**
 * Hook to monitor air quality and send notifications when thresholds are exceeded
 */
export const useAirQualityMonitoring = (options: AirQualityMonitoringOptions) => {
  const { sendAQIAlert, permission } = usePushNotifications();
  const previousAQI = useRef<number>(options.currentAQI);
  const lastNotificationLevel = useRef<string | null>(null);

  const thresholds = {
    warning: options.thresholds?.warning || 100,
    danger: options.thresholds?.danger || 150,
    critical: options.thresholds?.critical || 200,
  };

  const enabled = options.enabled !== false && permission === 'granted';

  useEffect(() => {
    if (!enabled) return;

    const { currentAQI, location } = options;

    // Determine the current level
    let currentLevel: 'critical' | 'danger' | 'warning' | null = null;
    let threshold = 0;

    if (currentAQI >= thresholds.critical) {
      currentLevel = 'critical';
      threshold = thresholds.critical;
    } else if (currentAQI >= thresholds.danger) {
      currentLevel = 'danger';
      threshold = thresholds.danger;
    } else if (currentAQI >= thresholds.warning) {
      currentLevel = 'warning';
      threshold = thresholds.warning;
    }

    // Only send notification if:
    // 1. AQI has increased (not decreased)
    // 2. We've crossed a threshold
    // 3. We haven't already sent a notification for this level
    if (
      currentLevel &&
      currentAQI > previousAQI.current &&
      lastNotificationLevel.current !== currentLevel
    ) {
      sendAQIAlert(currentAQI, location, threshold);
      lastNotificationLevel.current = currentLevel;
    }

    // If AQI drops below warning threshold, reset notification level
    if (currentAQI < thresholds.warning) {
      lastNotificationLevel.current = null;
    }

    previousAQI.current = currentAQI;
  }, [options.currentAQI, options.location, enabled, sendAQIAlert]);

  return {
    isMonitoring: enabled,
    currentLevel: lastNotificationLevel.current,
  };
};

export default useAirQualityMonitoring;
