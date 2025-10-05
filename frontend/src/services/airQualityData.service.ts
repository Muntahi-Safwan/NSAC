import api from './api';
import type { AQIData, PollutantData } from '../data/mockData';

interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface AQIResponse {
  success: boolean;
  data: {
    value: number;
    level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
    description: string;
    color: string;
    aqi: number;
    timestamp: string;
  };
}

interface PollutantResponse {
  success: boolean;
  data: {
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
    pollutants: Array<{
      name: string;
      value: number;
      unit: string;
      level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
      description: string;
      aqi?: number;
    }>;
  };
}

class AirQualityDataService {
  /**
   * Fetch AQI data for a specific location
   */
  async getAQIData(location: Location): Promise<AQIData | null> {
    try {
      const response = await api.get<AQIResponse>('/api/air-quality/aqi', {
        params: {
          lat: location.lat,
          lon: location.lng,
          tolerance: 0.5,
        },
      });

      if (response.data.success && response.data.data) {
        return {
          value: response.data.data.value,
          level: response.data.data.level,
          description: response.data.data.description,
          color: response.data.data.color,
          aqi: response.data.data.aqi,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      return null;
    }
  }

  /**
   * Fetch pollutant details for a specific location
   */
  async getPollutantData(location: Location): Promise<PollutantData[] | null> {
    try {
      const response = await api.get<PollutantResponse>('/api/air-quality/pollutants', {
        params: {
          lat: location.lat,
          lon: location.lng,
          tolerance: 0.5,
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data.pollutants;
      }

      return null;
    } catch (error) {
      console.error('Error fetching pollutant data:', error);
      return null;
    }
  }

  /**
   * Fetch both AQI and pollutant data for a location
   */
  async getAirQualityData(location: Location): Promise<{
    aqi: AQIData | null;
    pollutants: PollutantData[] | null;
  }> {
    try {
      const [aqiData, pollutantData] = await Promise.all([
        this.getAQIData(location),
        this.getPollutantData(location),
      ]);

      return {
        aqi: aqiData,
        pollutants: pollutantData,
      };
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      return {
        aqi: null,
        pollutants: null,
      };
    }
  }

  /**
   * Fetch trends data for charts
   */
  async getTrendsData(location: Location, hours: number = 24): Promise<{
    past: Array<{ hour: number; time: string; actual: number; predicted?: number | null; timestamp: string }>;
    future: Array<{ hour: number; time: string; predicted: number; timestamp: string }>;
  } | null> {
    try {
      const response = await api.get('/api/air-quality/trends-data', {
        params: {
          lat: location.lat,
          lon: location.lng,
          tolerance: 0.5,
          hours,
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching trends data:', error);
      return null;
    }
  }
}

export default new AirQualityDataService();
