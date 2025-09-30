/**
 * Air Quality Data Types
 * TypeScript interfaces for air quality data from the API
 */

export interface Pollutants {
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  co?: number;
  hcho?: number;
}

export interface AirQualityData {
  id: number;
  timestamp: string;
  forecastInitTime: string;
  latitude: number;
  longitude: number;
  level: number;
  aqi?: number;
  aqiCategory?: string;
  aqiColor?: string;
  aqiDescription?: string;
  dominantPollutant?: string;
  pollutants?: Pollutants;
  source: string;
  distance?: number;
}

export interface PollutantDetail {
  name: string;
  value: number;
  unit: string;
  aqi: number;
  category: string;
  color: string;
  description: string;
}

export interface PollutantDetailsResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  overall: {
    aqi: number;
    dominantPollutant: string;
    category: string;
    color: string;
    description: string;
  };
  pollutants: PollutantDetail[];
}

export interface MapDataPoint {
  id: number;
  latitude: number;
  longitude: number;
  aqi: number;
  aqiCategory: string;
  aqiColor: string;
  timestamp: string;
  pollutants: Pollutants;
}

export interface ForecastPoint extends AirQualityData {
  // Forecast-specific fields if needed
}

export interface TrendPoint extends AirQualityData {
  // Trend-specific fields if needed
}

export interface StatisticsData {
  totalRecords: number;
  oldestRecord: string | null;
  newestRecord: string | null;
  sources: string[];
  aqiDistribution?: {
    good: number;
    moderate: number;
    unhealthy_sensitive: number;
    unhealthy: number;
    very_unhealthy: number;
    hazardous: number;
    avg_aqi: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  timestamp?: string;
  message?: string;
  error?: string;
}

export type AirQualityAPIResponse = APIResponse<AirQualityData>;
export type ForecastAPIResponse = APIResponse<ForecastPoint[]>;
export type TrendsAPIResponse = APIResponse<TrendPoint[]>;
export type MapDataAPIResponse = APIResponse<MapDataPoint[]>;
export type PollutantDetailsAPIResponse = APIResponse<PollutantDetailsResponse>;
export type StatisticsAPIResponse = APIResponse<StatisticsData>;

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

// Query parameters for API calls
export interface AirQualityQueryParams {
  lat: number;
  lon: number;
  tolerance?: number;
}

export interface ForecastQueryParams extends AirQualityQueryParams {
  hours?: number;
}

export interface MapDataQueryParams {
  limit?: number;
  minAQI?: number;
  maxAQI?: number;
}

// AQI Category helpers
export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export const AQI_CATEGORY_RANGES: Record<AQICategory, [number, number]> = {
  Good: [0, 50],
  Moderate: [51, 100],
  'Unhealthy for Sensitive Groups': [101, 150],
  Unhealthy: [151, 200],
  'Very Unhealthy': [201, 300],
  Hazardous: [301, 500],
};

export const AQI_CATEGORY_COLORS: Record<AQICategory, string> = {
  Good: '#00E400',
  Moderate: '#FFFF00',
  'Unhealthy for Sensitive Groups': '#FF7E00',
  Unhealthy: '#FF0000',
  'Very Unhealthy': '#8F3F97',
  Hazardous: '#7E0023',
};
