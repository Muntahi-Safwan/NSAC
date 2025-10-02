import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

interface LocationData {
  city: string;
  region?: string;
  country: string;
  lat: number;
  lng: number;
}

interface LocationTrackerProps {
  userId: string;
  currentLocation?: LocationData | null;
  onLocationUpdate?: (location: LocationData) => void;
  autoTrigger?: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  userId,
  currentLocation,
  onLocationUpdate,
  autoTrigger = false
}) => {
  const [location, setLocation] = useState<LocationData | null>(currentLocation || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  // Auto-trigger location update on mount if enabled and no current location
  useEffect(() => {
    if (autoTrigger && !hasAutoTriggered && !currentLocation) {
      console.log('🚀 Auto-triggering location update...');
      setHasAutoTriggered(true);
      updateLocation();
    }
  }, [autoTrigger, hasAutoTriggered, currentLocation]);

  const updateLocation = async () => {
    setLoading(true);
    setMessage(null);
    console.log('🗺️ Starting location update...');

    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 GPS coordinates obtained:', { latitude, longitude });

        try {
          // Reverse geocode
          console.log('🔍 Reverse geocoding with OpenStreetMap...');
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const geoData = await geoResponse.json();
          console.log('🌍 Geocoding response:', geoData);

          const locationData: LocationData = {
            city: geoData.address.city ||
                  geoData.address.town ||
                  geoData.address.village ||
                  geoData.address.suburb ||
                  geoData.address.municipality ||
                  'Unknown City',
            region: geoData.address.state ||
                    geoData.address.county ||
                    geoData.address.state_district ||
                    geoData.address.region,
            country: geoData.address.country || 'Unknown',
            lat: latitude,
            lng: longitude
          };

          console.log('📌 Prepared location data:', locationData);

          // Save to backend
          console.log('💾 Sending to backend API...');
          const response = await axios.put('http://localhost:3000/api/user/location', {
            userId,
            city: locationData.city,
            region: locationData.region,
            country: locationData.country,
            lat: locationData.lat,
            lng: locationData.lng
          });

          console.log('✅ Backend response:', response.data);

          if (response.data.success) {
            setLocation(locationData);
            setMessage({ type: 'success', text: 'Location saved successfully!' });
            if (onLocationUpdate) {
              onLocationUpdate(locationData);
            }
          }
        } catch (error: any) {
          console.error('❌ Error in location update:', error);
          console.error('Error response:', error.response?.data);
          setMessage({
            type: 'error',
            text: `Failed to save location: ${error.response?.data?.error || error.message}`
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        let errorMsg = 'Unable to get location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Request timed out.';
            break;
        }

        setMessage({ type: 'error', text: errorMsg });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Current Location Display */}
      {location ? (
        <div className="p-4 bg-white/[0.05] border border-white/[0.08] rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <p className="text-white font-semibold text-lg">{location.city}</p>
              </div>
              <p className="text-blue-200 text-sm">
                {location.region && `${location.region}, `}
                {location.country}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={updateLocation}
              disabled={loading}
              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all disabled:opacity-50"
              title="Update location"
            >
              <Navigation className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4 border-2 border-dashed border-white/[0.1] rounded-xl">
          <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-4 opacity-50" />
          <p className="text-blue-200 mb-4">Location not set</p>
          <p className="text-blue-300 text-sm mb-4">
            Enable location to receive regional alerts from local NGOs
          </p>
          <button
            onClick={updateLocation}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center space-x-2 mx-auto"
          >
            <Navigation className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Getting Location...' : 'Enable Location'}</span>
          </button>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-400/30'
              : 'bg-red-500/10 border-red-400/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Info Text */}
      <p className="text-blue-200 text-sm">
        ℹ️ Your location helps local NGOs provide timely assistance during emergencies
      </p>
    </div>
  );
};

export default LocationTracker;
