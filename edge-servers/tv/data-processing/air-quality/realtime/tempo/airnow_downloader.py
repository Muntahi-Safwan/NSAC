"""
AirNOW Real-time PM2.5 Data Downloader

Downloads real-time PM2.5 data from EPA's AirNOW API to complement TEMPO data.
AirNOW provides ground-based measurements across North America.

Author: NSAC Team
Date: 2025-01-30
"""

import os
import sys
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import logging
from pathlib import Path
import time

# Add parent directories to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class AirNowDownloader:
    """
    Downloads real-time PM2.5 data from EPA's AirNOW API.
    
    AirNOW provides:
    - PM2.5 (Particulate Matter < 2.5μm)
    - Ground-based measurements
    - Hourly updates
    - North America coverage
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize AirNOW downloader.
        
        Args:
            api_key: AirNOW API key (optional, some endpoints are public)
        """
        self.api_key = api_key or os.getenv('AIRNOW_API_KEY')
        
        # AirNOW API endpoints
        self.base_url = "https://www.airnowapi.org/aq/observation"
        self.forecast_url = "https://www.airnowapi.org/aq/forecast"
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # North America bounds for filtering
        self.north_america_bounds = {
            'lat_min': 15.0,
            'lat_max': 60.0,
            'lon_min': -130.0,
            'lon_max': -60.0
        }
        
        # Rate limiting (AirNOW has limits)
        self.last_request_time = 0
        self.min_request_interval = 1  # 1 second between requests
        
    def _rate_limit(self):
        """Implement rate limiting for API requests."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
            
        self.last_request_time = time.time()
    
    def _is_within_north_america(self, lat: float, lon: float) -> bool:
        """Check if coordinates are within North America bounds."""
        return (self.north_america_bounds['lat_min'] <= lat <= self.north_america_bounds['lat_max'] and
                self.north_america_bounds['lon_min'] <= lon <= self.north_america_bounds['lon_max'])
    
    def get_current_pm25_data(self, bbox: Optional[Tuple[float, float, float, float]] = None) -> List[Dict]:
        """
        Get current PM2.5 data from AirNOW.
        
        Args:
            bbox: Optional bounding box (min_lon, min_lat, max_lon, max_lat)
            
        Returns:
            List of PM2.5 measurements
        """
        self._rate_limit()
        
        # Default to North America bounds
        if bbox is None:
            bbox = (-130.0, 15.0, -60.0, 60.0)
        
        # AirNOW API parameters
        params = {
            'format': 'application/json',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'hour': datetime.now().hour,
            'distance': 25,  # 25 miles radius
            'API_KEY': self.api_key
        }
        
        # Add bounding box if provided
        if bbox:
            params['bbox'] = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
        
        try:
            self.logger.info("Fetching current PM2.5 data from AirNOW...")
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Filter for PM2.5 data only and North America
            pm25_data = []
            for measurement in data:
                if (measurement.get('ParameterName') == 'PM2.5' and
                    self._is_within_north_america(measurement.get('Latitude', 0), 
                                                measurement.get('Longitude', 0))):
                    
                    pm25_data.append({
                        'timestamp': datetime.strptime(
                            f"{measurement['DateObserved']} {measurement['HourObserved']}:00:00",
                            '%Y-%m-%d %H:%M:%S'
                        ),
                        'latitude': measurement['Latitude'],
                        'longitude': measurement['Longitude'],
                        'pm25': measurement['Value'],
                        'unit': measurement['Unit'],
                        'aqi': measurement.get('AQI', None),
                        'category': measurement.get('Category', {}).get('Name', 'Unknown'),
                        'site_name': measurement.get('SiteName', 'Unknown'),
                        'state': measurement.get('StateCode', 'Unknown'),
                        'data_quality': 'AirNOW'
                    })
            
            self.logger.info(f"Retrieved {len(pm25_data)} PM2.5 measurements")
            return pm25_data
            
        except Exception as e:
            self.logger.error(f"Error fetching AirNOW data: {e}")
            return []
    
    def get_historical_pm25_data(self, date: str, hours_back: int = 24) -> List[Dict]:
        """
        Get historical PM2.5 data from AirNOW.
        
        Args:
            date: Date in YYYY-MM-DD format
            hours_back: Number of hours back to fetch
            
        Returns:
            List of PM2.5 measurements
        """
        all_data = []
        target_date = datetime.strptime(date, '%Y-%m-%d')
        
        # Fetch data for each hour
        for hour_offset in range(hours_back):
            target_hour = target_date - timedelta(hours=hour_offset)
            
            self._rate_limit()
            
            params = {
                'format': 'application/json',
                'date': target_hour.strftime('%Y-%m-%d'),
                'hour': target_hour.hour,
                'distance': 25,
                'API_KEY': self.api_key
            }
            
            try:
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                
                # Filter for PM2.5 data only and North America
                for measurement in data:
                    if (measurement.get('ParameterName') == 'PM2.5' and
                        self._is_within_north_america(measurement.get('Latitude', 0), 
                                                    measurement.get('Longitude', 0))):
                        
                        all_data.append({
                            'timestamp': datetime.strptime(
                                f"{measurement['DateObserved']} {measurement['HourObserved']}:00:00",
                                '%Y-%m-%d %H:%M:%S'
                            ),
                            'latitude': measurement['Latitude'],
                            'longitude': measurement['Longitude'],
                            'pm25': measurement['Value'],
                            'unit': measurement['Unit'],
                            'aqi': measurement.get('AQI', None),
                            'category': measurement.get('Category', {}).get('Name', 'Unknown'),
                            'site_name': measurement.get('SiteName', 'Unknown'),
                            'state': measurement.get('StateCode', 'Unknown'),
                            'data_quality': 'AirNOW'
                        })
                        
            except Exception as e:
                self.logger.warning(f"Error fetching data for {target_hour}: {e}")
                continue
        
        self.logger.info(f"Retrieved {len(all_data)} historical PM2.5 measurements")
        return all_data
    
    def get_pm25_coverage_stats(self) -> Dict:
        """
        Get statistics about PM2.5 data coverage.
        
        Returns:
            Dictionary with coverage statistics
        """
        try:
            # Get current data to analyze coverage
            current_data = self.get_current_pm25_data()
            
            if not current_data:
                return {
                    'total_stations': 0,
                    'states_covered': 0,
                    'geographic_bounds': 'N/A',
                    'data_quality': 'No data available'
                }
            
            # Analyze coverage
            states = set(measurement['state'] for measurement in current_data)
            lats = [m['latitude'] for m in current_data]
            lons = [m['longitude'] for m in current_data]
            
            return {
                'total_stations': len(current_data),
                'states_covered': len(states),
                'states_list': list(states),
                'geographic_bounds': {
                    'lat_min': min(lats),
                    'lat_max': max(lats),
                    'lon_min': min(lons),
                    'lon_max': max(lons)
                },
                'data_quality': 'Good' if len(current_data) > 100 else 'Limited'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting coverage stats: {e}")
            return {'error': str(e)}
    
    def test_api_connection(self) -> bool:
        """
        Test AirNOW API connection.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Simple test request
            params = {
                'format': 'application/json',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'hour': datetime.now().hour,
                'distance': 25
            }
            
            if self.api_key:
                params['API_KEY'] = self.api_key
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            self.logger.info("AirNOW API connection successful")
            return True
            
        except Exception as e:
            self.logger.error(f"AirNOW API connection failed: {e}")
            return False


def main():
    """Test the AirNOW downloader."""
    downloader = AirNowDownloader()
    
    # Test API connection
    print("Testing AirNOW API connection...")
    if downloader.test_api_connection():
        print("✓ AirNOW API connection successful")
        
        # Get current data
        print("\nFetching current PM2.5 data...")
        current_data = downloader.get_current_pm25_data()
        
        if current_data:
            print(f"Retrieved {len(current_data)} PM2.5 measurements")
            
            # Show sample data
            for i, measurement in enumerate(current_data[:5]):
                print(f"  {i+1}. {measurement['site_name']}, {measurement['state']}")
                print(f"     PM2.5: {measurement['pm25']} {measurement['unit']}")
                print(f"     AQI: {measurement['aqi']} ({measurement['category']})")
                print(f"     Location: {measurement['latitude']:.3f}, {measurement['longitude']:.3f}")
        else:
            print("No PM2.5 data retrieved")
        
        # Get coverage stats
        print("\nGetting coverage statistics...")
        stats = downloader.get_pm25_coverage_stats()
        print(f"Coverage: {stats}")
        
    else:
        print("✗ AirNOW API connection failed")
        print("Check your API key or network connection")


if __name__ == "__main__":
    main()

