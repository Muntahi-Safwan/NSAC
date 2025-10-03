#!/usr/bin/env python3
"""
Fire Data Processor
Processes NASA fire detection data files and extracts relevant information
"""

import csv
import os
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import logging


@dataclass
class FireDetection:
    """Single fire detection record"""
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
    frp: float  # Fire Radiative Power
    daynight: str


@dataclass
class FireSummary:
    """Daily fire summary for a region"""
    date: date
    satellite: str
    total_fires: int
    high_confidence_fires: int
    avg_frp: float
    max_frp: float
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float


class FireDataProcessor:
    """
    Processes NASA fire detection data files
    Filters data for North America and extracts relevant information
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # North America bounds (TEMPO coverage area)
        self.NA_BOUNDS = {
            'min_lat': 25.0,
            'max_lat': 50.0,
            'min_lon': -125.0,
            'max_lon': -65.0
        }
    
    def is_in_north_america(self, latitude: float, longitude: float) -> bool:
        """
        Check if coordinates are within North America bounds
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            True if within North America bounds
        """
        return (self.NA_BOUNDS['min_lat'] <= latitude <= self.NA_BOUNDS['max_lat'] and
                self.NA_BOUNDS['min_lon'] <= longitude <= self.NA_BOUNDS['max_lon'])
    
    def parse_fire_data_file(self, file_path: str) -> List[FireDetection]:
        """
        Parse a NASA fire data file and extract fire detections
        
        Args:
            file_path: Path to the fire data file
            
        Returns:
            List of FireDetection objects
        """
        fire_detections = []
        
        if not os.path.exists(file_path):
            self.logger.error(f"File not found: {file_path}")
            return fire_detections
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                # Check if file is empty
                first_line = f.readline().strip()
                if not first_line:
                    self.logger.warning(f"Empty file: {file_path}")
                    return fire_detections
                
                # Reset file pointer
                f.seek(0)
                
                # Parse CSV
                reader = csv.DictReader(f, delimiter=',')
                
                for row_num, row in enumerate(reader, 1):
                    try:
                        # Extract coordinates
                        latitude = float(row['latitude'])
                        longitude = float(row['longitude'])
                        
                        # Filter for North America
                        if not self.is_in_north_america(latitude, longitude):
                            continue
                        
                        # Parse date
                        acq_date_str = row['acq_date']
                        acq_date = datetime.strptime(acq_date_str, '%Y-%m-%d').date()
                        
                        # Create fire detection object
                        fire_detection = FireDetection(
                            latitude=latitude,
                            longitude=longitude,
                            brightness=float(row.get('brightness', 0)),
                            scan=float(row.get('scan', 0)),
                            track=float(row.get('track', 0)),
                            acq_date=acq_date,
                            acq_time=row.get('acq_time', ''),
                            satellite=row.get('satellite', ''),
                            confidence=row.get('confidence', ''),
                            version=row.get('version', ''),
                            bright_t31=float(row.get('bright_t31', 0)),
                            frp=float(row.get('frp', 0)),
                            daynight=row.get('daynight', '')
                        )
                        
                        fire_detections.append(fire_detection)
                        
                    except (ValueError, KeyError) as e:
                        self.logger.warning(f"Error parsing row {row_num} in {file_path}: {e}")
                        continue
            
            self.logger.info(f"Parsed {len(fire_detections)} fire detections from {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error parsing file {file_path}: {e}")
        
        return fire_detections
    
    def process_fire_data_files(self, file_paths: List[str]) -> List[FireDetection]:
        """
        Process multiple fire data files
        
        Args:
            file_paths: List of file paths to process
            
        Returns:
            Combined list of fire detections
        """
        all_fire_detections = []
        
        for file_path in file_paths:
            fire_detections = self.parse_fire_data_file(file_path)
            all_fire_detections.extend(fire_detections)
        
        self.logger.info(f"Total fire detections processed: {len(all_fire_detections)}")
        return all_fire_detections
    
    def create_fire_summaries(self, fire_detections: List[FireDetection]) -> List[FireSummary]:
        """
        Create daily fire summaries from fire detections
        
        Args:
            fire_detections: List of fire detection objects
            
        Returns:
            List of fire summary objects
        """
        summaries = []
        
        # Group by date and satellite
        grouped_data = {}
        for detection in fire_detections:
            key = (detection.acq_date, detection.satellite)
            if key not in grouped_data:
                grouped_data[key] = []
            grouped_data[key].append(detection)
        
        # Create summaries
        for (date, satellite), detections in grouped_data.items():
            if not detections:
                continue
            
            # Calculate statistics
            total_fires = len(detections)
            high_confidence_fires = len([d for d in detections if d.confidence in ['high', 'n']])
            
            frp_values = [d.frp for d in detections if d.frp > 0]
            avg_frp = sum(frp_values) / len(frp_values) if frp_values else 0
            max_frp = max(frp_values) if frp_values else 0
            
            latitudes = [d.latitude for d in detections]
            longitudes = [d.longitude for d in detections]
            
            summary = FireSummary(
                date=date,
                satellite=satellite,
                total_fires=total_fires,
                high_confidence_fires=high_confidence_fires,
                avg_frp=avg_frp,
                max_frp=max_frp,
                min_lat=min(latitudes),
                max_lat=max(latitudes),
                min_lon=min(longitudes),
                max_lon=max(longitudes)
            )
            
            summaries.append(summary)
        
        self.logger.info(f"Created {len(summaries)} fire summaries")
        return summaries
    
    def filter_by_confidence(self, fire_detections: List[FireDetection], 
                           min_confidence: str = 'nominal') -> List[FireDetection]:
        """
        Filter fire detections by confidence level
        
        Args:
            fire_detections: List of fire detection objects
            min_confidence: Minimum confidence level ('nominal', 'low', 'high')
            
        Returns:
            Filtered list of fire detections
        """
        confidence_levels = {'nominal': 0, 'low': 1, 'high': 2}
        min_level = confidence_levels.get(min_confidence, 0)
        
        filtered = []
        for detection in fire_detections:
            detection_level = confidence_levels.get(detection.confidence, 0)
            if detection_level >= min_level:
                filtered.append(detection)
        
        self.logger.info(f"Filtered {len(fire_detections)} -> {len(filtered)} detections (min confidence: {min_confidence})")
        return filtered
    
    def filter_by_frp(self, fire_detections: List[FireDetection], 
                     min_frp: float = 0.0) -> List[FireDetection]:
        """
        Filter fire detections by Fire Radiative Power (FRP)
        
        Args:
            fire_detections: List of fire detection objects
            min_frp: Minimum FRP value
            
        Returns:
            Filtered list of fire detections
        """
        filtered = [d for d in fire_detections if d.frp >= min_frp]
        
        self.logger.info(f"Filtered {len(fire_detections)} -> {len(filtered)} detections (min FRP: {min_frp})")
        return filtered


def main():
    """Test the fire processor"""
    print("🔥 Testing Fire Data Processor")
    
    processor = FireDataProcessor()
    
    # Test North America filtering
    test_coords = [
        (40.7128, -74.0060, "New York"),  # Should pass
        (51.5074, -0.1278, "London"),     # Should fail
        (35.0, -100.0, "Oklahoma"),       # Should pass
        (20.0, -80.0, "Cuba"),            # Should fail
    ]
    
    for lat, lon, location in test_coords:
        in_na = processor.is_in_north_america(lat, lon)
        print(f"{location}: ({lat}, {lon}) -> {'✅' if in_na else '❌'}")
    
    print("✅ Fire processor tests completed")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()

