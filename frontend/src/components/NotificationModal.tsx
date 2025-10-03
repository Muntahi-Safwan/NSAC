import React, { useState } from 'react';
import { X, AlertTriangle, Info, AlertCircle, CheckCircle, Phone, MapPin, Clock, Shield } from 'lucide-react';
import type { Notification } from '../contexts/NotificationContext';
import api from '../services/api';

interface NotificationModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  userId
}) => {
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'not-safe' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const getSeverityIcon = () => {
    switch (notification.severity?.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'danger':
        return <AlertCircle className="w-12 h-12 text-orange-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (notification.severity?.toLowerCase()) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'danger':
        return 'from-orange-500 to-orange-600';
      case 'warning':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const handleSafetyUpdate = async (status: 'safe' | 'not-safe') => {
    setIsSubmitting(true);
    try {
      await api.put('/user/safety-status', {
        userId: userId,
        isSafe: status === 'safe'
      });

      setSafetyStatus(status);
      setSubmitSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating safety status:', error);
      alert('Failed to update safety status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getSeverityColor()} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                {getSeverityIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {notification.title}
                </h2>
                <div className="flex items-center space-x-3">
                  {notification.severity && (
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold uppercase">
                      {notification.severity}
                    </span>
                  )}
                  {notification.isAlert && (
                    <span className="px-2 py-1 bg-red-600/80 backdrop-blur-sm rounded-lg text-white text-xs font-bold uppercase animate-pulse">
                      🚨 ALERT
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-200 text-base leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* NGO Info */}
            {notification.ngo && (
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">
                    From
                  </h3>
                </div>
                <p className="text-white font-medium">{notification.ngo.name}</p>
                {notification.ngo.contactPhone && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Phone className="w-3 h-3 text-blue-400" />
                    <p className="text-blue-200 text-sm">{notification.ngo.contactPhone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Region */}
            {notification.region && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                    Region
                  </h3>
                </div>
                <p className="text-white font-medium">{notification.region}</p>
              </div>
            )}

            {/* Timestamp */}
            <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-400/20 rounded-2xl p-4 col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide">
                  Sent At
                </h3>
              </div>
              <p className="text-white font-medium">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Safety Status Update */}
          {!submitSuccess ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Update Your Safety Status
              </h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                Let others know if you're safe in response to this alert
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSafetyUpdate('safe')}
                  disabled={isSubmitting}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{isSubmitting ? 'Updating...' : "I'm Safe"}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSafetyUpdate('not-safe')}
                  disabled={isSubmitting}
                  className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{isSubmitting ? 'Updating...' : 'Need Help'}</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400 animate-bounce" />
                <div>
                  <p className="text-white font-bold text-lg">
                    {safetyStatus === 'safe' ? 'Marked as Safe!' : 'Help Request Sent!'}
                  </p>
                  <p className="text-green-300 text-sm">
                    {safetyStatus === 'safe'
                      ? 'Your safety status has been updated successfully.'
                      : 'Emergency services have been notified.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
