import api from './api';
import type {
  AirQualityQueryParams,
  ForecastQueryParams,
  MapDataQueryParams,
  AirQualityAPIResponse,
  ForecastAPIResponse,
  TrendsAPIResponse,
  MapDataAPIResponse,
  PollutantDetailsAPIResponse,
  StatisticsAPIResponse,
} from '../types/airQuality.types';

/**
 * Air Quality Service
 * Handles all API calls related to air quality data
 */

const AIR_QUALITY_BASE = '/api/air-quality';

class AirQualityService {
  /**
   * Get current air quality for a specific location
   * @param params - Location coordinates and optional tolerance
   * @returns Current air quality data
   */
  async getCurrentAirQuality(params: AirQualityQueryParams): Promise<AirQualityAPIResponse> {
    try {
      const response = await api.get<AirQualityAPIResponse>(`${AIR_QUALITY_BASE}/current`, {
        params: {
          lat: params.lat,
          lon: params.lon,
          tolerance: params.tolerance || 0.5,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current air quality:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch current air quality');
    }
  }

  /**
   * Get 24-hour forecast for a specific location
   * @param params - Location coordinates, optional tolerance and hours
   * @returns Forecast data points
   */
  async getForecast(params: ForecastQueryParams): Promise<ForecastAPIResponse> {
    try {
      const response = await api.get<ForecastAPIResponse>(`${AIR_QUALITY_BASE}/forecast`, {
        params: {
          lat: params.lat,
          lon: params.lon,
          tolerance: params.tolerance || 0.5,
          hours: params.hours || 24,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching forecast:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
    }
  }

  /**
   * Get historical trends for a specific location
   * @param params - Location coordinates, optional tolerance and hours back
   * @returns Historical trend data points
   */
  async getTrends(params: ForecastQueryParams): Promise<TrendsAPIResponse> {
    try {
      const response = await api.get<TrendsAPIResponse>(`${AIR_QUALITY_BASE}/trends`, {
        params: {
          lat: params.lat,
          lon: params.lon,
          tolerance: params.tolerance || 0.5,
          hours: params.hours || 24,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching trends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch trend data');
    }
  }

  /**
   * Get air quality data for all regions (for map visualization)
   * @param params - Optional filters (limit, min/max AQI)
   * @returns Array of map data points
   */
  async getMapData(params?: MapDataQueryParams): Promise<MapDataAPIResponse> {
    try {
      const response = await api.get<MapDataAPIResponse>(`${AIR_QUALITY_BASE}/map-data`, {
        params: {
          limit: params?.limit || 500,
          minAQI: params?.minAQI,
          maxAQI: params?.maxAQI,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching map data:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch map data');
    }
  }

  /**
   * Get detailed pollutant breakdown for a specific location
   * @param params - Location coordinates and optional tolerance
   * @returns Detailed pollutant data
   */
  async getPollutantDetails(params: AirQualityQueryParams): Promise<PollutantDetailsAPIResponse> {
    try {
      const response = await api.get<PollutantDetailsAPIResponse>(`${AIR_QUALITY_BASE}/pollutants`, {
        params: {
          lat: params.lat,
          lon: params.lon,
          tolerance: params.tolerance || 0.5,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pollutant details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pollutant details');
    }
  }

  /**
   * Get database statistics
   * @returns Statistics about the air quality database
   */
  async getStatistics(): Promise<StatisticsAPIResponse> {
    try {
      const response = await api.get<StatisticsAPIResponse>(`${AIR_QUALITY_BASE}/statistics`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }

  /**
   * Get combined data (current + forecast + trends) for a location
   * Useful for dashboard views that need all data at once
   */
  async getCompleteData(params: AirQualityQueryParams & { forecastHours?: number; trendHours?: number }) {
    try {
      const [current, forecast, trends] = await Promise.all([
        this.getCurrentAirQuality(params),
        this.getForecast({ ...params, hours: params.forecastHours || 24 }),
        this.getTrends({ ...params, hours: params.trendHours || 24 }),
      ]);

      return {
        current: current.data,
        forecast: forecast.data || [],
        trends: trends.data || [],
      };
    } catch (error: any) {
      console.error('Error fetching complete data:', error);
      throw new Error('Failed to fetch complete air quality data');
    }
  }
}

// Export singleton instance
const airQualityService = new AirQualityService();
export default airQualityService;
