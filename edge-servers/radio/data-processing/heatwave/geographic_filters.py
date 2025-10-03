"""
Geographic filtering utilities for heatwave predictions
Consistent with air quality system TEMPO coverage area
"""

from typing import Tuple, List
import numpy as np


class TempoGeographicFilter:
    """
    Geographic filter for TEMPO satellite coverage area (North America)
    Consistent with air quality system filtering
    """
    
    # TEMPO coverage bounds (same as air quality system)
    TEMPO_LAT_MIN = 25.0   # Southern boundary (Gulf of Mexico)
    TEMPO_LAT_MAX = 50.0   # Northern boundary (Southern Canada)
    TEMPO_LON_MIN = -125.0 # Western boundary (Pacific Coast)
    TEMPO_LON_MAX = -65.0  # Eastern boundary (Atlantic Coast)
    
    @classmethod
    def is_in_tempo_coverage(cls, latitude: float, longitude: float) -> bool:
        """
        Check if a location is within TEMPO coverage area
        
        Args:
            latitude: Latitude in degrees
            longitude: Longitude in degrees
            
        Returns:
            True if location is within TEMPO coverage, False otherwise
        """
        return (cls.TEMPO_LAT_MIN <= latitude <= cls.TEMPO_LAT_MAX and 
                cls.TEMPO_LON_MIN <= longitude <= cls.TEMPO_LON_MAX)
    
    @classmethod
    def filter_locations(cls, latitudes: np.ndarray, longitudes: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Filter arrays of coordinates to only include TEMPO coverage area
        
        Args:
            latitudes: Array of latitude values
            longitudes: Array of longitude values
            
        Returns:
            Tuple of (filtered_latitudes, filtered_longitudes, mask)
        """
        # Create boolean mask for TEMPO coverage
        lat_mask = (latitudes >= cls.TEMPO_LAT_MIN) & (latitudes <= cls.TEMPO_LAT_MAX)
        lon_mask = (longitudes >= cls.TEMPO_LON_MIN) & (longitudes <= cls.TEMPO_LON_MAX)
        tempo_mask = lat_mask & lon_mask
        
        return latitudes[tempo_mask], longitudes[tempo_mask], tempo_mask
    
    @classmethod
    def get_coverage_info(cls) -> dict:
        """
        Get information about TEMPO coverage area
        
        Returns:
            Dictionary with coverage area details
        """
        lat_range = cls.TEMPO_LAT_MAX - cls.TEMPO_LAT_MIN
        lon_range = cls.TEMPO_LON_MAX - cls.TEMPO_LON_MIN
        
        # Approximate area calculation (simplified)
        # At these latitudes, 1 degree ≈ 111 km lat, ~85 km lon (average)
        approx_area_km2 = lat_range * 111 * lon_range * 85
        
        return {
            'name': 'TEMPO Satellite Coverage Area',
            'region': 'North America',
            'bounds': {
                'lat_min': cls.TEMPO_LAT_MIN,
                'lat_max': cls.TEMPO_LAT_MAX,
                'lon_min': cls.TEMPO_LON_MIN,
                'lon_max': cls.TEMPO_LON_MAX
            },
            'coverage': {
                'lat_range_degrees': lat_range,
                'lon_range_degrees': lon_range,
                'approximate_area_km2': approx_area_km2,
                'approximate_area_million_km2': approx_area_km2 / 1_000_000
            },
            'grid_points_025deg': {
                'lat_points': int(lat_range / 0.25),  # ~100 points
                'lon_points': int(lon_range / 0.25),  # ~240 points
                'total_points': int(lat_range / 0.25) * int(lon_range / 0.25)  # ~24,000 points
            }
        }
    
    @classmethod
    def print_coverage_summary(cls):
        """Print a summary of TEMPO coverage area"""
        info = cls.get_coverage_info()
        
        print(f"🌍 {info['name']}")
        print(f"   Region: {info['region']}")
        print(f"   Latitude: {info['bounds']['lat_min']}° to {info['bounds']['lat_max']}°")
        print(f"   Longitude: {info['bounds']['lon_min']}° to {info['bounds']['lon_max']}°")
        print(f"   Area: ~{info['coverage']['approximate_area_million_km2']:.1f} million km²")
        print(f"   Grid points (0.25°): {info['grid_points_025deg']['total_points']:,}")


# Note: Regional thresholds have been moved to north_american_climate.py
# This provides a more comprehensive and simplified approach focused on North America only


def main():
    """Example usage of geographic filtering"""
    print("🌡️ Heatwave Geographic Filtering Example")
    print("=" * 50)
    
    # Show TEMPO coverage info
    TempoGeographicFilter.print_coverage_summary()
    
    # Test some locations
    test_locations = [
        (40.7128, -74.0060, "New York City"),
        (34.0522, -118.2437, "Los Angeles"),
        (25.7617, -80.1918, "Miami"),
        (47.6062, -122.3321, "Seattle"),
        (60.0, -100.0, "Northern Canada (outside TEMPO)")
    ]
    
    print(f"\n📍 Location Testing:")
    for lat, lon, name in test_locations:
        in_tempo = TempoGeographicFilter.is_in_tempo_coverage(lat, lon)
        status = "✅ INCLUDED" if in_tempo else "❌ FILTERED OUT"
        print(f"   {name}: {status}")
        
        if in_tempo:
            # Import here to avoid circular imports
            from north_american_climate import NorthAmericanHeatwaveThresholds
            region = NorthAmericanHeatwaveThresholds.get_climate_region(lat, lon)
            print(f"      Region: {region['region_name']}")
            print(f"      Thresholds: {region['temp_thresholds']}")
            print(f"      Heat Index Critical: {region['heat_index_critical']}")
    
    print(f"\n💾 Database Impact:")
    coverage_info = TempoGeographicFilter.get_coverage_info()
    global_points = 1440 * 721  # Full GEOS-CF grid
    tempo_points = coverage_info['grid_points_025deg']['total_points']
    reduction = (1 - tempo_points / global_points) * 100
    
    print(f"   Global grid points: {global_points:,}")
    print(f"   TEMPO coverage points: {tempo_points:,}")
    print(f"   Geographic reduction: {reduction:.1f}%")
    print(f"   Focus: North American climate zones only")


if __name__ == "__main__":
    main()
