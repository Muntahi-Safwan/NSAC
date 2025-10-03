import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, TestTube, Settings } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    requestPermission,
    sendTestNotification
  } = usePushNotifications();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // Auto-send test notification on first grant
      handleTestNotification();
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const notification = await sendTestNotification();
      setTestResult(notification ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult(null);
      }, 3000);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <XCircle className="w-5 h-5 text-gray-400" />,
        text: 'Not Supported',
        subtext: 'Your browser does not support push notifications',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          text: 'Enabled',
          subtext: 'You will receive hazard alerts and important updates',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      case 'denied':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          text: 'Blocked',
          subtext: 'Please enable notifications in your browser settings',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        };
      default:
        return {
          icon: <BellOff className="w-5 h-5 text-yellow-400" />,
          text: 'Not Enabled',
          subtext: 'Enable notifications to receive critical air quality alerts',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
        };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-blue-400/20 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-display font-bold text-lg">
            Push Notifications
          </h3>
          <p className="text-white/60 text-sm">
            Manage your alert preferences
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`${status.bgColor} border ${status.borderColor} rounded-xl p-4 mb-6`}>
        <div className="flex items-start gap-3">
          {status.icon}
          <div className="flex-1">
            <div className={`${status.color} font-semibold mb-1`}>
              {status.text}
            </div>
            <p className="text-white/70 text-sm">
              {status.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {permission === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Enable Notifications
          </button>
        )}

        {permission === 'granted' && (
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="w-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : testResult === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                Test Sent Successfully!
              </>
            ) : testResult === 'error' ? (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                Test Failed
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                Send Test Notification
              </>
            )}
          </button>
        )}

        {permission === 'denied' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm mb-2 font-semibold">
              How to enable notifications:
            </p>
            <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" in the permissions list</li>
              <li>Change the setting to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>

      {/* Info */}
      {permission === 'granted' && (
        <div className="mt-6 pt-6 border-t border-white/[0.08]">
          <h4 className="text-white font-semibold text-sm mb-3">
            You'll receive notifications for:
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Critical air quality alerts (AQI &gt; 200)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <span>Danger level alerts (AQI &gt; 150)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Warning level alerts (AQI &gt; 100)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Health recommendations and emergency contacts</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
