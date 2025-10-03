import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationPermissionBanner: React.FC = () => {
  const { isSupported, permission, requestPermission, sendTestNotification } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Show banner if notifications are supported but permission not granted
    if (isSupported && permission === 'default') {
      // Check if user has previously dismissed the banner
      const dismissed = localStorage.getItem('notification-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, [isSupported, permission]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        setShowSuccess(true);
        setTimeout(() => {
          setShowBanner(false);
          // Send a welcome notification
          sendTestNotification();
        }, 2000);
      } else {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!showBanner || !isSupported) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-fade-in-down">
      <div className="bg-gradient-to-r from-blue-600/95 to-cyan-600/95 backdrop-blur-xl border border-blue-400/30 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {showSuccess ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Bell className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {showSuccess ? (
              <>
                <h3 className="text-white font-display font-bold text-base mb-1">
                  ✅ Notifications Enabled!
                </h3>
                <p className="text-white/90 text-sm">
                  You'll receive alerts for critical air quality changes and hazards.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-white font-display font-bold text-base mb-1">
                  Enable Hazard Alerts
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  Get instant notifications for critical air quality alerts and emergencies.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    className="flex-1 bg-white hover:bg-white/90 text-blue-600 font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isRequesting ? 'Requesting...' : 'Enable Alerts'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-white/80 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    Later
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Close Button */}
          {!showSuccess && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Info Badge */}
        {!showSuccess && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>You can change this anytime in your browser settings</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
