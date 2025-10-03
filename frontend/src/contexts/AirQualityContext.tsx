import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import airQualityService from '../services/airQuality.service';
import type {
  AirQualityData,
  Location,
  ForecastPoint,
  TrendPoint,
  MapDataPoint,
} from '../types/airQuality.types';

interface AirQualityContextType {
  // Current location and data
  location: Location | null;
  currentData: AirQualityData | null;
  forecast: ForecastPoint[];
  trends: TrendPoint[];
  mapData: MapDataPoint[];

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setLocation: (location: Location) => void;
  refreshData: () => Promise<void>;
  refreshMapData: () => Promise<void>;
  clearError: () => void;
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

interface AirQualityProviderProps {
  children: ReactNode;
  autoRefreshInterval?: number; // in milliseconds, default 5 minutes
}

export const AirQualityProvider = ({ children, autoRefreshInterval = 5 * 60 * 1000 }: AirQualityProviderProps) => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [currentData, setCurrentData] = useState<AirQualityData | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for a specific location
  const fetchLocationData = useCallback(async (loc: Location) => {
    if (!loc) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        lat: loc.latitude,
        lon: loc.longitude,
        tolerance: 0.5,
      };

      // Fetch current, forecast, and trends in parallel
      const completeData = await airQualityService.getCompleteData(params);

      setCurrentData(completeData.current || null);
      setForecast(completeData.forecast || []);
      setTrends(completeData.trends || []);
    } catch (err: any) {
      console.error('Error fetching location data:', err);
      setError(err.message || 'Failed to fetch air quality data');
      setCurrentData(null);
      setForecast([]);
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch map data (independent of location)
  const refreshMapData = useCallback(async () => {
    try {
      const response = await airQualityService.getMapData({ limit: 500 });
      setMapData(response.data || []);
    } catch (err: any) {
      console.error('Error fetching map data:', err);
      // Don't set error state for map data failures - allow UI to continue
    }
  }, []);

  // Set location and fetch data
  const setLocation = useCallback(
    (newLocation: Location) => {
      setLocationState(newLocation);
      fetchLocationData(newLocation);
    },
    [fetchLocationData]
  );

  // Refresh current location data
  const refreshData = useCallback(async () => {
    if (location) {
      await fetchLocationData(location);
    }
  }, [location, fetchLocationData]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh data at specified interval
  useEffect(() => {
    if (!location || !autoRefreshInterval) return;

    const intervalId = setInterval(() => {
      console.log('Auto-refreshing air quality data...');
      refreshData();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [location, autoRefreshInterval, refreshData]);

  // Initial map data load
  useEffect(() => {
    refreshMapData();
  }, [refreshMapData]);

  // Try to get user's geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'Your Location',
          };
          setLocation(userLocation);
        },
        (err) => {
          console.log('Geolocation not available:', err.message);
          // Set a default location (e.g., New York City)
          const defaultLocation: Location = {
            latitude: 40.7128,
            longitude: -74.006,
            name: 'New York City',
          };
          setLocation(defaultLocation);
        }
      );
    } else {
      // Geolocation not supported, use default
      const defaultLocation: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        name: 'New York City',
      };
      setLocation(defaultLocation);
    }
  }, [setLocation]);

  const value: AirQualityContextType = {
    location,
    currentData,
    forecast,
    trends,
    mapData,
    isLoading,
    error,
    setLocation,
    refreshData,
    refreshMapData,
    clearError,
  };

  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>;
};

// Custom hook to use the context
export const useAirQuality = () => {
  const context = useContext(AirQualityContext);
  if (context === undefined) {
    throw new Error('useAirQuality must be used within an AirQualityProvider');
  }
  return context;
};

export default AirQualityContext;
