"""
GEOS-CF Analysis Data Processor
Processes downloaded analysis files to extract NO2, O3, PM2.5 data
"""

import netCDF4 as nc
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
import os
from dataclasses import dataclass


@dataclass
class GeosCfAnalysisDataPoint:
    """Represents a single GEOS-CF analysis measurement."""
    timestamp: datetime
    latitude: float
    longitude: float
    level: float
    pm25: Optional[float] = None  # μg/m³
    no2: Optional[float] = None   # μg/m³
    o3: Optional[float] = None    # μg/m³
    so2: Optional[float] = None   # μg/m³
    co: Optional[float] = None    # μg/m³
    source: str = "GEOS-CF-ANALYSIS"


class GeosCfAnalysisProcessor:
    """
    Processes GEOS-CF analysis NetCDF files to extract air quality data
    """
    
    def __init__(self):
        """Initialize the processor"""
        pass
    
    def process_analysis_file(self, file_path: str, sample_rate: int = 1, 
                            tempo_coverage_only: bool = True) -> List[GeosCfAnalysisDataPoint]:
        """
        Process a GEOS-CF analysis file and extract air quality data
        
        Args:
            file_path: Path to the analysis NetCDF file
            sample_rate: Sample every Nth point to reduce data size (default: 1 for health alerts)
            tempo_coverage_only: Only extract data for TEMPO coverage area (default: True)
            
        Returns:
            List of GeosCfAnalysisDataPoint objects
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Analysis file not found: {file_path}")
        
        print(f"\n🔬 Processing GEOS-CF analysis file: {os.path.basename(file_path)}")
        
        # Extract timestamp from filename
        analysis_timestamp = self._extract_timestamp_from_filename(file_path)
        print(f"   Analysis time: {analysis_timestamp} UTC")
        
        # TEMPO coverage area (North America)
        if tempo_coverage_only:
            LAT_MIN, LAT_MAX = 25.0, 50.0  # More restrictive latitude bounds
            LON_MIN, LON_MAX = -125.0, -65.0  # More restrictive longitude bounds
            print(f"   📍 Filtering to TEMPO coverage: Lat [{LAT_MIN}°, {LAT_MAX}°], Lon [{LON_MIN}°, {LON_MAX}°]")
        
        try:
            with nc.Dataset(file_path, 'r') as dataset:
                print(f"   📊 Dataset dimensions: {dict(dataset.dimensions)}")
                
                # Read coordinate arrays
                lev = dataset.variables['lev'][:]
                lat = dataset.variables['lat'][:]
                lon = dataset.variables['lon'][:]
                
                # Variable names for GEOS-CF analysis files
                pollutant_config = {
                    'pm25': {
                        'vars': ['PM25_RH35_GCC', 'PM25'],
                        'needs_conversion': False,  # Already in μg/m³
                        'unit': 'μg/m³'
                    },
                    'no2': {
                        'vars': ['NO2'],
                        'needs_conversion': True,  # Convert from mol/mol to μg/m³
                        'unit': 'mol/mol'
                    },
                    'o3': {
                        'vars': ['O3'],
                        'needs_conversion': True,  # Convert from mol/mol to μg/m³
                        'unit': 'mol/mol'
                    },
                    'so2': {
                        'vars': ['SO2'],
                        'needs_conversion': True,  # Convert from mol/mol to μg/m³
                        'unit': 'mol/mol'
                    },
                    'co': {
                        'vars': ['CO'],
                        'needs_conversion': True,  # Convert from mol/mol to μg/m³
                        'unit': 'mol/mol'
                    }
                }
                
                # Load available pollutant data
                pollutant_data = {}
                available_pollutants = []
                
                for pollutant, config in pollutant_config.items():
                    for var_name in config['vars']:
                        if var_name in dataset.variables:
                            raw_data = dataset.variables[var_name][:]
                            pollutant_data[pollutant] = {
                                'data': raw_data,
                                'needs_conversion': config['needs_conversion']
                            }
                            
                            unit_info = f"({config['unit']})"
                            if config['needs_conversion']:
                                unit_info += " → μg/m³"
                            
                            available_pollutants.append(pollutant.upper())
                            print(f"   ✓ Found {pollutant.upper()}: {var_name} {unit_info}")
                            break
                
                if not pollutant_data:
                    raise RuntimeError("No pollutant data found in analysis file!")
                
                print(f"   📊 Available pollutants: {', '.join(available_pollutants)}")
                
                # Extract data points
                data_points = []
                total_points = 0
                valid_points = 0
                
                # Sample the data to reduce size
                for i in range(0, len(lat), sample_rate):
                    for j in range(0, len(lon), sample_rate):
                        total_points += 1
                        
                        current_lat = float(lat[i])
                        current_lon = float(lon[j])
                        
                        # Filter to TEMPO coverage if requested
                        if tempo_coverage_only:
                            if not (LAT_MIN <= current_lat <= LAT_MAX and LON_MIN <= current_lon <= LON_MAX):
                                continue
                        
                        # Get surface level data (level 0 or lowest level)
                        surface_level = float(lev[0]) if len(lev) > 0 else 0.0
                        
                        # Extract pollutant values
                        pm25_value = None
                        no2_value = None
                        o3_value = None
                        so2_value = None
                        co_value = None
                        
                        # PM2.5 (already in μg/m³)
                        if 'pm25' in pollutant_data:
                            pm25_raw = pollutant_data['pm25']['data'][0, 0, i, j]  # [time, lev, lat, lon]
                            if not np.isnan(pm25_raw) and pm25_raw > 0:
                                pm25_value = float(pm25_raw)
                        
                        # Gas-phase pollutants (convert from mol/mol to μg/m³)
                        for pollutant, data_info in pollutant_data.items():
                            if pollutant == 'pm25':
                                continue
                            
                            raw_value = data_info['data'][0, 0, i, j]  # [time, lev, lat, lon]
                            
                            if not np.isnan(raw_value) and raw_value > 0:
                                if data_info['needs_conversion']:
                                    # Convert from mol/mol to μg/m³
                                    # Using molecular weights and standard atmospheric conditions
                                    mw = {'no2': 46.00, 'o3': 48.00, 'so2': 64.00, 'co': 28.00}[pollutant]
                                    converted_value = float(raw_value * mw * 42273)  # Conversion factor
                                else:
                                    converted_value = float(raw_value)
                                
                                # Assign to appropriate variable
                                if pollutant == 'no2':
                                    no2_value = converted_value
                                elif pollutant == 'o3':
                                    o3_value = converted_value
                                elif pollutant == 'so2':
                                    so2_value = converted_value
                                elif pollutant == 'co':
                                    co_value = converted_value
                        
                        # Only create data point if we have at least one valid pollutant
                        if any([pm25_value, no2_value, o3_value, so2_value, co_value]):
                            data_point = GeosCfAnalysisDataPoint(
                                timestamp=analysis_timestamp,
                                latitude=current_lat,
                                longitude=current_lon,
                                level=surface_level,
                                pm25=pm25_value,
                                no2=no2_value,
                                o3=o3_value,
                                so2=so2_value,
                                co=co_value,
                                source="GEOS-CF-ANALYSIS"
                            )
                            data_points.append(data_point)
                            valid_points += 1
                
                print(f"   📈 Processing complete:")
                print(f"      Total points checked: {total_points:,}")
                print(f"      Valid data points: {valid_points:,}")
                print(f"      Sample rate: 1/{sample_rate}")
                
                return data_points
                
        except Exception as e:
            print(f"   ❌ Error processing analysis file: {e}")
            raise
    
    def _extract_timestamp_from_filename(self, file_path: str) -> datetime:
        """
        Extract timestamp from GEOS-CF analysis filename
        
        Args:
            file_path: Path to the analysis file
            
        Returns:
            datetime object extracted from filename
        """
        filename = os.path.basename(file_path)
        
        try:
            # Filename format: GEOS-CF.v01.rpl.aqc_tavg_1hr_g1440x721_v1.20250930_1130z.nc4
            # Extract the timestamp part: 20250930_1130z
            parts = filename.split('.')
            time_part = parts[-2]  # e.g., "20250930_1130z"
            
            # Parse timestamp: "20250930_1130z"
            timestamp_str = time_part.replace('z', '')
            analysis_timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M")
            
            return analysis_timestamp
            
        except Exception as e:
            print(f"⚠️ Warning: Could not parse timestamp from filename: {e}")
            return datetime.utcnow()


def main():
    """Test the GEOS-CF Analysis Processor"""
    print("🧪 Testing GEOS-CF Analysis Processor")
    
    processor = GeosCfAnalysisProcessor()
    
    # Test with a sample file (if available)
    test_file = "air-quality/realtime/downloads/GEOS-CF.v01.rpl.aqc_tavg_1hr_g1440x721_v1.20250930_1130z.nc4"
    
    if os.path.exists(test_file):
        try:
            data_points = processor.process_analysis_file(test_file, sample_rate=50)
            print(f"\n✅ Success! Processed {len(data_points)} data points")
            
            # Show sample data points
            if data_points:
                print(f"\n📋 Sample data points:")
                for i, point in enumerate(data_points[:3]):
                    pollutants = []
                    if point.pm25 is not None: pollutants.append(f"PM2.5={point.pm25:.2f}")
                    if point.no2 is not None: pollutants.append(f"NO2={point.no2:.2f}")
                    if point.o3 is not None: pollutants.append(f"O3={point.o3:.2f}")
                    
                    print(f"   {i+1}. {point.timestamp} | {point.latitude:.2f}°N, {point.longitude:.2f}°W | {', '.join(pollutants)}")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print(f"⚠️ Test file not found: {test_file}")
        print("   Run the downloader first to get a test file")


if __name__ == "__main__":
    main()

