"""
NetCDF Data Processor for GEOS-CF Air Quality Files
Extracts and processes PM2.5 data from downloaded forecast files
"""

import netCDF4 as nc
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
import os


class AirQualityDataPoint:
    """OOP representation of a single air quality data point with multiple pollutants"""
    
    def __init__(self, timestamp: datetime, forecast_init_time: datetime, 
                 latitude: float, longitude: float, level: float, 
                 pm25: Optional[float] = None,
                 no2: Optional[float] = None,
                 o3: Optional[float] = None,
                 so2: Optional[float] = None,
                 co: Optional[float] = None,
                 hcho: Optional[float] = None):
        self.timestamp = timestamp
        self.forecast_init_time = forecast_init_time
        self.latitude = latitude
        self.longitude = longitude
        self.level = level
        self.pm25 = pm25
        self.no2 = no2
        self.o3 = o3
        self.so2 = so2
        self.co = co
        self.hcho = hcho
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for database insertion"""
        return {
            'timestamp': self.timestamp,
            'forecastInitTime': self.forecast_init_time,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'level': self.level,
            'pm25': self.pm25,
            'no2': self.no2,
            'o3': self.o3,
            'so2': self.so2,
            'co': self.co,
            'hcho': self.hcho,
            'source': 'GEOS-CF'
        }
    
    def __repr__(self):
        pollutants = []
        if self.pm25 is not None: pollutants.append(f"PM2.5={self.pm25:.2f}")
        if self.no2 is not None: pollutants.append(f"NO2={self.no2:.2f}")
        if self.o3 is not None: pollutants.append(f"O3={self.o3:.2f}")
        return (f"AirQualityDataPoint(time={self.timestamp}, "
                f"lat={self.latitude:.2f}, lon={self.longitude:.2f}, "
                f"{', '.join(pollutants)})")


class NetCDFProcessor:
    """
    OOP approach for processing GEOS-CF NetCDF files
    """
    
    def __init__(self, file_path: str):
        """
        Initialize processor with a NetCDF file
        
        Args:
            file_path: Path to the .nc4 file
        """
        self.file_path = file_path
        self.dataset = None
        self.forecast_init_time = None
        self.data_timestamp = None
    
    def __enter__(self):
        """Context manager entry"""
        self.open()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
    
    def open(self):
        """Open the NetCDF file"""
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"File not found: {self.file_path}")
        
        print(f"📂 Opening NetCDF file: {self.file_path}")
        self.dataset = nc.Dataset(self.file_path, 'r')
        self._extract_metadata()
    
    def close(self):
        """Close the NetCDF file"""
        if self.dataset:
            self.dataset.close()
            self.dataset = None
    
    def _extract_metadata(self):
        """Extract timestamp and forecast init time from filename"""
        # Filename format: GEOS-CF.v01.fcst.aqc_tavg_1hr_g1440x721_v1.20250927_12z+20250927_1230z.nc4
        filename = os.path.basename(self.file_path)
        
        try:
            # Extract init time and data time from filename
            parts = filename.split('.')
            time_part = parts[-2]  # e.g., "20250927_12z+20250927_1230z"
            
            init_part, data_part = time_part.split('+')
            
            # Parse init time: "20250927_12z"
            init_date = init_part.split('_')[0]
            init_hour = init_part.split('_')[1].replace('z', '')
            self.forecast_init_time = datetime.strptime(f"{init_date}{init_hour}", "%Y%m%d%H")
            
            # Parse data time: "20250927_1230z"
            data_datetime = data_part.replace('z', '')
            self.data_timestamp = datetime.strptime(data_datetime, "%Y%m%d_%H%M")
            
            print(f"   Forecast Init: {self.forecast_init_time} UTC")
            print(f"   Data Time: {self.data_timestamp} UTC")
            
        except Exception as e:
            print(f"⚠️ Warning: Could not parse timestamp from filename: {e}")
            self.forecast_init_time = datetime.utcnow()
            self.data_timestamp = datetime.utcnow()
    
    def get_dimensions(self) -> Dict:
        """Get dataset dimensions"""
        return {
            'time': len(self.dataset.dimensions['time']),
            'lev': len(self.dataset.dimensions['lev']),
            'lat': len(self.dataset.dimensions['lat']),
            'lon': len(self.dataset.dimensions['lon'])
        }
    
    def extract_air_quality_data(self, sample_rate: int = 10, 
                                  tempo_coverage_only: bool = True) -> List[AirQualityDataPoint]:
        """
        Extract multiple pollutants from the NetCDF file
        Filters to TEMPO coverage area (North America) by default
        
        Args:
            sample_rate: Sample every Nth point to reduce data size (default: 10)
                        1 = all points (~1M records), 10 = ~100K records, 20 = ~50K records
            tempo_coverage_only: Only extract data for TEMPO coverage area (default: True)
        
        Returns:
            List of AirQualityDataPoint objects
        """
        if self.dataset is None:
            raise RuntimeError("Dataset not opened. Call open() first.")
        
        # TEMPO coverage area (North America)
        # Latitude: ~15°N to ~60°N, Longitude: ~-130°W to ~-60°W
        TEMPO_LAT_MIN, TEMPO_LAT_MAX = 15.0, 60.0
        TEMPO_LON_MIN, TEMPO_LON_MAX = -130.0, -60.0
        
        print(f"\n🔬 Extracting air quality data from NetCDF...")
        if tempo_coverage_only:
            print(f"   📍 Filtering to TEMPO coverage: Lat [{TEMPO_LAT_MIN}°, {TEMPO_LAT_MAX}°], Lon [{TEMPO_LON_MIN}°, {TEMPO_LON_MAX}°]")
        
        # Get dimensions
        dims = self.get_dimensions()
        print(f"   Dimensions: {dims}")
        print(f"   Sample rate: 1/{sample_rate} (sampling every {sample_rate} points)")
        
        # Read coordinate arrays
        lev = self.dataset.variables['lev'][:]
        lat = self.dataset.variables['lat'][:]
        lon = self.dataset.variables['lon'][:]
        
        # Variable names and molecular weights for GEOS-CF NetCDF files
        # Based on actual file inspection - exact names from NASA GEOS-CF
        pollutant_config = {
            'pm25': {
                'vars': ['PM25_RH35_GCC', 'PM25'],
                'mw': None,  # Already in μg/m³
                'unit': 'μg/m³'
            },
            'no2': {
                'vars': ['NO2'],
                'mw': 46.00,  # g/mol
                'unit': 'mol/mol'
            },
            'o3': {
                'vars': ['O3'],
                'mw': 48.00,  # g/mol
                'unit': 'mol/mol'
            },
            'so2': {
                'vars': ['SO2'],
                'mw': 64.00,  # g/mol
                'unit': 'mol/mol'
            },
            'co': {
                'vars': ['CO'],
                'mw': 28.00,  # g/mol
                'unit': 'mol/mol'
            },
            'hcho': {
                'vars': ['HCHO', 'CH2O'],
                'mw': 30.03,  # g/mol
                'unit': 'mol/mol'
            }
        }
        
        # Conversion factor: mol/mol to μg/m³
        # Formula: C(μg/m³) = VMR × MW × (ρ_air / MW_air) × 10⁹
        # At standard conditions: ρ_air = 1.225 kg/m³, MW_air = 28.97 g/mol
        # Simplified: C(μg/m³) = VMR × MW × 42,273
        CONVERSION_FACTOR = 42273  # (1.225 / 28.97) × 10⁹
        
        # Load available pollutant data
        pollutant_data = {}
        available_pollutants = []
        
        for pollutant, config in pollutant_config.items():
            for var_name in config['vars']:
                if var_name in self.dataset.variables:
                    raw_data = self.dataset.variables[var_name][:]
                    
                    # Store raw data and conversion info
                    pollutant_data[pollutant] = {
                        'data': raw_data,
                        'mw': config['mw'],
                        'needs_conversion': config['mw'] is not None
                    }
                    
                    unit_info = f"({config['unit']})"
                    if config['mw']:
                        unit_info += " → μg/m³"
                    
                    available_pollutants.append(pollutant.upper())
                    print(f"   ✓ Found {pollutant.upper()}: {var_name} {unit_info}")
                    break
        
        if not pollutant_data:
            raise RuntimeError("No pollutant data found in NetCDF file!")
        
        print(f"   📊 Available pollutants: {', '.join(available_pollutants)}")
        print(f"   🔄 Will convert gas-phase pollutants from mol/mol to μg/m³")
        
        # Extract data points
        data_points = []
        total_points = dims['lev'] * dims['lat'] * dims['lon']
        sampled_points = 0
        filtered_out = 0
        
        print(f"\n   Processing {total_points:,} total points...")
        
        for lev_idx in range(0, dims['lev'], sample_rate):
            for lat_idx in range(0, dims['lat'], sample_rate):
                latitude = float(lat[lat_idx])
                
                # Filter by TEMPO latitude range
                if tempo_coverage_only and (latitude < TEMPO_LAT_MIN or latitude > TEMPO_LAT_MAX):
                    filtered_out += 1
                    continue
                
                for lon_idx in range(0, dims['lon'], sample_rate):
                    longitude = float(lon[lon_idx])
                    
                    # Filter by TEMPO longitude range
                    if tempo_coverage_only and (longitude < TEMPO_LON_MIN or longitude > TEMPO_LON_MAX):
                        filtered_out += 1
                        continue
                    
                    # Extract pollutant values and apply unit conversions
                    pollutants = {}
                    has_valid_data = False
                    
                    for pollutant, info in pollutant_data.items():
                        raw_value = float(info['data'][0, lev_idx, lat_idx, lon_idx])
                        
                        if np.isnan(raw_value):
                            pollutants[pollutant] = None
                            continue
                        
                        # Convert mol/mol to μg/m³ for gas-phase pollutants
                        if info['needs_conversion']:
                            # C(μg/m³) = VMR(mol/mol) × MW(g/mol) × 42,273
                            converted_value = raw_value * info['mw'] * CONVERSION_FACTOR
                            pollutants[pollutant] = converted_value
                        else:
                            # PM2.5 is already in μg/m³
                            pollutants[pollutant] = raw_value
                        
                        has_valid_data = True
                    
                    # Skip if all values are NaN
                    if not has_valid_data:
                        continue
                    
                    data_point = AirQualityDataPoint(
                        timestamp=self.data_timestamp,
                        forecast_init_time=self.forecast_init_time,
                        latitude=latitude,
                        longitude=longitude,
                        level=float(lev[lev_idx]),
                        **pollutants
                    )
                    
                    data_points.append(data_point)
                    sampled_points += 1
                    
                    # Progress indicator
                    if sampled_points % 10000 == 0:
                        print(f"\r   Processed: {sampled_points:,} points...", end='')
        
        print(f"\r   ✅ Extracted {len(data_points):,} valid data points")
        if tempo_coverage_only:
            print(f"   📊 Filtered out {filtered_out:,} points outside TEMPO coverage")
        
        return data_points
    
    # Keep old method name for backward compatibility
    def extract_pm25_data(self, sample_rate: int = 10) -> List[AirQualityDataPoint]:
        """Legacy method - calls extract_air_quality_data without filtering"""
        return self.extract_air_quality_data(sample_rate, tempo_coverage_only=False)
    
    def get_summary_stats(self) -> Dict:
        """Get summary statistics of the dataset"""
        if self.dataset is None:
            raise RuntimeError("Dataset not opened. Call open() first.")
        
        stats = {}
        
        # Try to get stats for available pollutants
        pollutant_vars = {
            'pm25': ['PM25_RH35_GCC', 'PM25'],
            'no2': ['NO2', 'NO2_GCC'],
            'o3': ['O3', 'O3_GCC'],
        }
        
        # Find the first available pollutant for overall stats
        first_available_data = None
        first_available_var = None
        
        for pollutant, possible_names in pollutant_vars.items():
            for var_name in possible_names:
                if var_name in self.dataset.variables:
                    data = self.dataset.variables[var_name][:]
                    stats[pollutant] = {
                        'min': float(np.nanmin(data)),
                        'max': float(np.nanmax(data)),
                        'mean': float(np.nanmean(data)),
                        'median': float(np.nanmedian(data)),
                    }
                    
                    # Store first available data for overall stats
                    if first_available_data is None:
                        first_available_data = data
                        first_available_var = var_name
                    break
        
        # Get overall dimensions and stats from first available pollutant
        if first_available_data is not None:
            stats['shape'] = first_available_data.shape
            stats['total_points'] = first_available_data.size
            stats['valid_points'] = int(np.sum(~np.isnan(first_available_data)))
            
            # Add overall min/max/mean/median for backward compatibility
            stats['min'] = float(np.nanmin(first_available_data))
            stats['max'] = float(np.nanmax(first_available_data))
            stats['mean'] = float(np.nanmean(first_available_data))
            stats['median'] = float(np.nanmedian(first_available_data))
        
        return stats


def process_file(file_path: str, sample_rate: int = 10) -> List[AirQualityDataPoint]:
    """
    Convenience function to process a NetCDF file
    
    Args:
        file_path: Path to NetCDF file
        sample_rate: Sample every Nth point
        
    Returns:
        List of AirQualityDataPoint objects
    """
    with NetCDFProcessor(file_path) as processor:
        stats = processor.get_summary_stats()
        print(f"\n📊 Dataset Statistics:")
        print(f"   PM2.5 Range: [{stats['min']:.4f}, {stats['max']:.4f}]")
        print(f"   Mean: {stats['mean']:.4f}, Median: {stats['median']:.4f}")
        print(f"   Total points: {stats['total_points']:,}")
        print(f"   Valid points: {stats['valid_points']:,}")
        
        data_points = processor.extract_pm25_data(sample_rate=sample_rate)
        
    return data_points


if __name__ == "__main__":
    # Example usage
    import glob
    
    # Find any .nc4 files in downloads folder
    nc_files = glob.glob("./downloads/*.nc4")
    
    if nc_files:
        print(f"Found {len(nc_files)} NetCDF file(s)")
        print(f"Processing: {nc_files[0]}\n")
        
        # Process with sample rate of 20 (about 50K records)
        data_points = process_file(nc_files[0], sample_rate=20)
        
        print(f"\n✅ Processed {len(data_points):,} data points")
        print(f"\nFirst 5 data points:")
        for point in data_points[:5]:
            print(f"  {point}")
    else:
        print("❌ No .nc4 files found in ./downloads/")
        print("Run smart_downloader.py first to download a file.")

