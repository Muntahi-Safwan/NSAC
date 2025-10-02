import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Bell,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  Settings,
  Navigation,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Background from '../../components/Background';

interface UserLocation {
  city: string;
  region?: string;
  country: string;
  lat: number;
  lng: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: string;
  isAlert: boolean;
  createdAt: string;
  ngo: {
    name: string;
    contactPhone?: string;
  };
}

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isSafe, setIsSafe] = useState(true);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchUserData();
      fetchNotifications();
    }
  }, [user, isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/user/profile/${user?.id}`);
      if (response.data.success) {
        const userData = response.data.data.user;
        setIsSafe(userData.isSafe);
        if (userData.lastLocation) {
          setLocation(userData.lastLocation);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/notifications/user/${user?.id}`);
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    console.log('🗺️ Requesting location permission...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Location obtained:', { latitude, longitude });

          // Reverse geocode to get location details
          try {
            console.log('🔍 Reverse geocoding...');
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            console.log('🌍 Geocode response:', data);

            const locationData: UserLocation = {
              city: data.address.city || data.address.town || data.address.village || data.address.suburb || 'Unknown',
              region: data.address.state || data.address.county || data.address.state_district,
              country: data.address.country || 'Unknown',
              lat: latitude,
              lng: longitude
            };

            console.log('📌 Location data prepared:', locationData);

            // Save location to backend
            console.log('💾 Saving location to backend...');
            const saveResponse = await axios.put('http://localhost:3000/api/user/location', {
              userId: user?.id,
              city: locationData.city,
              region: locationData.region,
              country: locationData.country,
              lat: locationData.lat,
              lng: locationData.lng
            });

            console.log('✅ Location saved successfully:', saveResponse.data);
            setLocation(locationData);
            alert('Location saved successfully!');
          } catch (error: any) {
            console.error('❌ Error saving location:', error);
            console.error('Error details:', error.response?.data);
            alert(`Failed to save location: ${error.response?.data?.error || error.message}`);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }

          alert(errorMessage);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const updateSafetyStatus = async (safe: boolean) => {
    try {
      const response = await axios.put('http://localhost:3000/api/user/safety-status', {
        userId: user?.id,
        isSafe: safe
      });

      if (response.data.success) {
        setIsSafe(safe);
      }
    } catch (error) {
      console.error('Error updating safety status:', error);
      alert('Failed to update safety status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'danger':
        return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
  };

  if (loading) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Welcome, {user?.firstName || 'User'}!
              </h1>
              <p className="text-blue-200">Stay safe and informed about air quality in your area</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Safety Status Card */}
              <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-cyan-400" />
                  Safety Status
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isSafe
                          ? 'bg-green-500/20 border-2 border-green-400'
                          : 'bg-orange-500/20 border-2 border-orange-400'
                      }`}
                    >
                      {isSafe ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {isSafe ? 'You are Safe' : 'You need Help'}
                      </p>
                      <p className="text-blue-200 text-sm">
                        {isSafe
                          ? 'Mark yourself as unsafe if you need assistance'
                          : 'Local NGOs have been notified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isSafe && (
                      <button
                        onClick={() => updateSafetyStatus(true)}
                        className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-all shadow-lg"
                      >
                        Mark as Safe
                      </button>
                    )}
                    {isSafe && (
                      <button
                        onClick={() => updateSafetyStatus(false)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg"
                      >
                        Need Help
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-cyan-400" />
                  Your Location
                </h2>

                {location ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold text-lg">{location.city}</p>
                          <p className="text-blue-200 text-sm">
                            {location.region && `${location.region}, `}
                            {location.country}
                          </p>
                          <p className="text-blue-300 text-xs mt-2">
                            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </p>
                        </div>
                        <button
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Navigation className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-blue-200 text-sm">
                      ℹ️ Your location helps local NGOs provide timely assistance during emergencies
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-4 opacity-50" />
                    <p className="text-blue-200 mb-4">Location not set</p>
                    <button
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center space-x-2 mx-auto"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>{locationLoading ? 'Getting Location...' : 'Enable Location'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Notifications */}
            <div className="space-y-6">
              <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6">
                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center">
                  <Bell className="w-6 h-6 mr-3 text-cyan-400" />
                  Alerts & Notifications
                  {notifications.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </h2>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-blue-300 mx-auto mb-4 opacity-50" />
                      <p className="text-blue-200">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => setSelectedNotification(notification)}
                        className={`p-4 border rounded-xl cursor-pointer hover:bg-white/[0.08] transition-all ${getSeverityColor(
                          notification.severity
                        )}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold flex-1">{notification.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getSeverityBadge(
                              notification.severity
                            )}`}
                          >
                            {notification.severity}
                          </span>
                        </div>
                        <p className="text-blue-200 text-sm line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-300">From: {notification.ngo.name}</span>
                          <span className="text-blue-300 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {notification.isAlert && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-red-400 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Disaster Alert
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-white/[0.1] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-display font-bold text-white">
                      {selectedNotification.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium border ${getSeverityBadge(
                        selectedNotification.severity
                      )}`}
                    >
                      {selectedNotification.severity}
                    </span>
                  </div>
                  {selectedNotification.isAlert && (
                    <div className="inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-lg text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Disaster Alert
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-white/[0.08] rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-blue-200 whitespace-pre-line">{selectedNotification.message}</p>
                </div>

                <div className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl">
                  <p className="text-blue-200 text-sm mb-2">
                    <strong className="text-white">From:</strong> {selectedNotification.ngo.name}
                  </p>
                  {selectedNotification.ngo.contactPhone && (
                    <p className="text-blue-200 text-sm">
                      <strong className="text-white">Contact:</strong>{' '}
                      {selectedNotification.ngo.contactPhone}
                    </p>
                  )}
                  <p className="text-blue-200 text-sm">
                    <strong className="text-white">Date:</strong>{' '}
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.1]">
                  <p className="text-blue-200 text-sm mb-4">Update your safety status:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateSafetyStatus(true);
                        setSelectedNotification(null);
                      }}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I'm Safe
                    </button>
                    <button
                      onClick={() => {
                        updateSafetyStatus(false);
                        setSelectedNotification(null);
                      }}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Need Help
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </Background>
  );
};

export default UserDashboard;
