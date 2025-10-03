#!/usr/bin/env python3
"""
Fire API Client - Direct API integration for NASA FIRMS
Gets fire data directly from API and processes it without file downloads
"""

import os
import requests
import logging
from datetime import datetime, date
from typing import List, Dict, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class FireDetection:
    """Fire detection data from NASA FIRMS API"""
    latitude: float
    longitude: float
    brightness: float
    scan: float
    track: float
    acq_date: date
    acq_time: str
    satellite: str
    confidence: str
    version: str
    bright_t31: float
    frp: float
    daynight: str
    alert_level: int = 0
    alert_sent: bool = False

class FireAPIClient:
    """
    NASA FIRMS API client for real-time fire detection data
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.api_key = os.getenv('NASA_FIRMS_API_KEY')
        self.base_url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'
        
        if not self.api_key:
            self.logger.warning("⚠️ No NASA FIRMS API key found - will use direct file downloads")
            self.logger.info("   Set NASA_FIRMS_API_KEY in .env file for better data access")
    
    def get_fire_data(self, satellite: str = 'VIIRS', days: int = 1, area: str = 'world') -> List[FireDetection]:
        """
        Get fire detection data directly from NASA FIRMS API
        
        Args:
            satellite: 'MODIS' or 'VIIRS'
            days: Number of days back to get data
            area: Area to get data for ('world' or coordinates like '-180,-90,180,90')
            
        Returns:
            List of FireDetection objects
        """
        if not self.api_key:
            self.logger.error("API key required for NASA FIRMS API access")
            return []
        
        try:
            # Build API URL - handle different satellite formats
            if satellite == 'VIIRS':
                source = 'VIIRS_SNPP_NRT'
            elif satellite == 'MODIS':
                source = 'MODIS_NRT'
            else:
                source = f"{satellite}_SNPP_NRT"
                
            api_url = f"{self.base_url}/{self.api_key}/{source}/{area}/{days}"
            self.logger.info(f"🌐 API URL: {api_url}")
            
            # Make API request
            response = requests.get(api_url, timeout=60)
            self.logger.info(f"📊 Response status: {response.status_code}")
            response.raise_for_status()
            
            # Parse CSV response
            content = response.text.strip()
            if not content:
                self.logger.warning(f"No data returned from API")
                return []
            
            lines = content.split('\n')
            if len(lines) <= 1:
                self.logger.warning(f"Only header returned, no fire data")
                return []
            
            # Parse CSV data
            fire_detections = []
            header = lines[0].split(',')
            self.logger.info(f"📋 CSV Header: {header}")
            self.logger.info(f"📊 Total lines received: {len(lines)}")
            
            total_parsed = 0
            north_america_count = 0
            
            for line in lines[1:]:
                if not line.strip():
                    continue
                    
                try:
                    parts = line.split(',')
                    if len(parts) < 13:
                        self.logger.debug(f"Skipping line with insufficient parts: {len(parts)}")
                        continue
                    
                    # Parse fire detection data
                    detection = FireDetection(
                        latitude=float(parts[0]),
                        longitude=float(parts[1]),
                        brightness=float(parts[2]) if parts[2] else 0.0,
                        scan=float(parts[3]) if parts[3] else 0.0,
                        track=float(parts[4]) if parts[4] else 0.0,
                        acq_date=datetime.strptime(parts[5], '%Y-%m-%d').date(),
                        acq_time=parts[6],
                        satellite=parts[7],
                        confidence=parts[9],
                        version=parts[10],
                        bright_t31=float(parts[11]) if parts[11] else 0.0,
                        frp=float(parts[12]) if parts[12] else 0.0,
                        daynight=parts[13] if len(parts) > 13 else 'N'
                    )
                    
                    total_parsed += 1
                    
                    # Filter for North America
                    if self._is_in_north_america(detection.latitude, detection.longitude):
                        fire_detections.append(detection)
                        north_america_count += 1
                        
                        # Log first few detections for debugging
                        if north_america_count <= 3:
                            self.logger.info(f"   Fire {north_america_count}: Lat {detection.latitude:.4f}, Lon {detection.longitude:.4f}, Date {detection.acq_date}")
                        
                except (ValueError, IndexError) as e:
                    self.logger.debug(f"Skipping malformed line: {line[:50]}... Error: {e}")
                    continue
            
            self.logger.info(f"📊 Parsed {total_parsed} total fires, {north_america_count} in North America")
            
            self.logger.info(f"✅ Retrieved {len(fire_detections)} fire detections for North America")
            return fire_detections
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Error processing fire data: {e}")
            return []
    
    def _is_in_north_america(self, latitude: float, longitude: float) -> bool:
        """
        Check if coordinates are within North America bounds
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            True if coordinates are in North America
        """
        # North America bounds: west, south, east, north
        west_bound, south_bound, east_bound, north_bound = -180, 15, -50, 85
        
        return (south_bound <= latitude <= north_bound and 
                west_bound <= longitude <= east_bound)
    
    def _remove_duplicates(self, fires: List[FireDetection]) -> List[FireDetection]:
        """
        Remove duplicate fire detections based on location, date, and time
        
        Args:
            fires: List of fire detections
            
        Returns:
            List of unique fire detections
        """
        seen = set()
        unique_fires = []
        
        for fire in fires:
            # Create a unique key based on location, date, and time
            key = (round(fire.latitude, 4), round(fire.longitude, 4), 
                   fire.acq_date, fire.acq_time, fire.satellite)
            
            if key not in seen:
                seen.add(key)
                unique_fires.append(fire)
        
        return unique_fires
    
    def get_recent_fires(self, hours_back: int = 1) -> List[FireDetection]:
        """
        Get recent fire detections from both VIIRS and MODIS (last 1 hour by default)
        This is designed to be called hourly by cron job
        
        Args:
            hours_back: Number of hours back to look for fires (default 1 for hourly runs)
            
        Returns:
            List of recent FireDetection objects from both sources
        """
        # For hourly runs, we only need 1 day of data (covers the last 24 hours)
        # The API will return the most recent data available
        days = 1
        
        self.logger.info(f"🔍 Getting fire data for last {hours_back} hour(s) (using {days} day API call)")
        
        # Get data from both VIIRS and MODIS
        all_fires = []
        
        # Get VIIRS data
        self.logger.info("📡 Getting VIIRS_SNPP_NRT data...")
        viirs_fires = self.get_fire_data(satellite='VIIRS', days=days, area='world')
        all_fires.extend(viirs_fires)
        self.logger.info(f"   VIIRS: {len(viirs_fires)} fires")
        
        # Get MODIS data
        self.logger.info("📡 Getting MODIS_NRT data...")
        modis_fires = self.get_fire_data(satellite='MODIS', days=days, area='world')
        all_fires.extend(modis_fires)
        self.logger.info(f"   MODIS: {len(modis_fires)} fires")
        
        # Remove duplicates based on location, date, and time
        unique_fires = self._remove_duplicates(all_fires)
        self.logger.info(f"   Total unique fires: {len(unique_fires)}")
        
        return unique_fires

def main():
    """Test the fire API client"""
    logging.basicConfig(level=logging.INFO)
    
    print("🔥 Testing Fire API Client")
    print("=" * 50)
    
    # Initialize API client
    client = FireAPIClient()
    
    # Get recent fire data
    fires = client.get_recent_fires(hours_back=24)
    
    if fires:
        print(f"✅ Found {len(fires)} fire detections")
        
        # Show sample data
        print("\n📊 Sample fire detections:")
        for i, fire in enumerate(fires[:3]):
            print(f"  {i+1}. Lat: {fire.latitude:.4f}, Lon: {fire.longitude:.4f}")
            print(f"     Date: {fire.acq_date}, Time: {fire.acq_time}")
            print(f"     Brightness: {fire.brightness}, FRP: {fire.frp}")
            print(f"     Confidence: {fire.confidence}, Satellite: {fire.satellite}")
            print()
    else:
        print("❌ No fire detections found")
    
    print("✅ Fire API Client test completed")

if __name__ == "__main__":
    main()
