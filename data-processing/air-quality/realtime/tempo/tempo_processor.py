"""
TEMPO Data Processor

Processes downloaded TEMPO NetCDF files to extract air quality measurements.
Handles NO2 and O3 data from TEMPO V4 files.
"""

import os
import logging
import numpy as np
import xarray as xr
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass

@dataclass
class TempoDataPoint:
    """Represents a single TEMPO measurement."""
    timestamp: datetime
    latitude: float
    longitude: float
    level: float
    value: float
    product: str
    source: str = "TEMPO"

class TempoProcessor:
    """
    Processes TEMPO NetCDF files to extract air quality measurements.
    
    Supports:
    - NO2: Nitrogen Dioxide from TEMPO_NO2_L2_V04
    - O3: Ozone from TEMPO_O3TOT_L2_V04
    """
    
    def __init__(self):
        """Initialize the TEMPO processor."""
        self.logger = logging.getLogger(__name__)
        
        # Define expected variables for each product
        self.product_variables = {
            "no2": [
                "NO2_TroposphericVerticalColumn",
                "tropospheric_NO2_column", 
                "NO2",
                "nitrogen_dioxide"
            ],
            "o3": [
                "O3TotalColumn",
                "total_ozone",
                "O3",
                "ozone"
            ]
        }
        
        # Coordinate variable names
        self.coord_names = {
            "latitude": ["lat", "latitude", "y"],
            "longitude": ["lon", "longitude", "x"],
            "time": ["time", "datetime", "t"]
        }
    
    def _find_variable(self, dataset: xr.Dataset, product: str) -> Optional[str]:
        """
        Find the correct variable name in the dataset.
        
        Args:
            dataset: xarray Dataset
            product: Product type ('no2' or 'o3')
            
        Returns:
            Variable name if found, None otherwise
        """
        possible_vars = self.product_variables.get(product, [])
        
        for var_name in possible_vars:
            if var_name in dataset.variables:
                self.logger.info(f"Found {product.upper()} variable: {var_name}")
                return var_name
        
        # If not found, list available variables
        available_vars = list(dataset.variables.keys())
        self.logger.warning(f"No {product.upper()} variable found. Available variables: {available_vars}")
        return None
    
    def _find_coordinates(self, dataset: xr.Dataset) -> Dict[str, str]:
        """
        Find coordinate variable names in the dataset.
        
        Args:
            dataset: xarray Dataset
            
        Returns:
            Dictionary with coordinate names
        """
        coords = {}
        available_vars = list(dataset.variables.keys())
        
        for coord_type, possible_names in self.coord_names.items():
            for name in possible_names:
                if name in available_vars:
                    coords[coord_type] = name
                    break
        
        self.logger.info(f"Found coordinates: {coords}")
        return coords
    
    def _filter_north_america(self, data: xr.DataArray, lat_coord: str, lon_coord: str) -> xr.DataArray:
        """
        Filter data to North America coverage (TEMPO coverage area).
        
        Args:
            data: xarray DataArray
            lat_coord: Latitude coordinate name
            lon_coord: Longitude coordinate name
            
        Returns:
            Filtered DataArray
        """
        # TEMPO coverage: North America
        # Latitude: ~15°N to ~60°N
        # Longitude: ~-130°W to ~-60°W
        
        lat_min, lat_max = 15.0, 60.0
        lon_min, lon_max = -130.0, -60.0
        
        # Apply geographic filter
        filtered = data.where(
            (data[lat_coord] >= lat_min) & 
            (data[lat_coord] <= lat_max) &
            (data[lon_coord] >= lon_min) & 
            (data[lon_coord] <= lon_max),
            drop=True
        )
        
        self.logger.info(f"Filtered to North America: {filtered.size} points")
        return filtered
    
    def _convert_units(self, value: float, product: str) -> float:
        """
        Convert units to μg/m³ for AQI calculation.
        
        Args:
            value: Raw value from NetCDF
            product: Product type ('no2' or 'o3')
            
        Returns:
            Converted value in μg/m³
        """
        if product == "no2":
            # NO2: Convert from mol/m² to μg/m³
            # Approximate conversion (may need adjustment based on actual units)
            # 1 mol/m² ≈ 46 g/m² (NO2 molecular weight)
            # For surface concentration, assume 1 km height
            # 1 g/m² / 1000 m = 1 mg/m³ = 1000 μg/m³
            converted = value * 46 * 1000  # Placeholder conversion
        elif product == "o3":
            # O3: Convert from DU (Dobson Units) to μg/m³
            # 1 DU = 2.69 × 10^16 molecules/cm²
            # For surface concentration approximation
            converted = value * 2.14  # Placeholder conversion
        else:
            converted = value
        
        return converted
    
    def _extract_measurements(self, data: xr.DataArray, coords: Dict[str, str], product: str) -> List[TempoDataPoint]:
        """
        Extract measurements from processed data.
        
        Args:
            data: Processed xarray DataArray
            coords: Coordinate names dictionary
            product: Product type
            
        Returns:
            List of TempoDataPoint objects
        """
        measurements = []
        
        # Get coordinate arrays
        lat_coord = coords.get("latitude")
        lon_coord = coords.get("longitude")
        time_coord = coords.get("time")
        
        if not lat_coord or not lon_coord:
            self.logger.error("Missing latitude or longitude coordinates")
            return measurements
        
        # Convert to numpy arrays for processing
        lats = data[lat_coord].values
        lons = data[lon_coord].values
        values = data.values
        
        # Handle time dimension
        if time_coord and time_coord in data.dims:
            times = data[time_coord].values
            if len(times) > 0:
                # Use the first time if multiple times
                timestamp = times[0] if hasattr(times[0], 'item') else str(times[0])
            else:
                timestamp = datetime.now().isoformat()
        else:
            timestamp = datetime.now().isoformat()
        
        # Extract valid measurements
        valid_mask = ~np.isnan(values)
        valid_lats = lats[valid_mask]
        valid_lons = lons[valid_mask]
        valid_values = values[valid_mask]
        
        # Create measurement records
        for i in range(len(valid_values)):
            if not np.isnan(valid_values[i]):
                # Convert units
                converted_value = self._convert_units(valid_values[i], product)
                
                # Parse timestamp
                if isinstance(timestamp, str):
                    try:
                        parsed_timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    except:
                        parsed_timestamp = datetime.now()
                else:
                    parsed_timestamp = timestamp
                
                measurement = TempoDataPoint(
                    timestamp=parsed_timestamp,
                    latitude=float(valid_lats[i]),
                    longitude=float(valid_lons[i]),
                    level=0.0,  # Surface level
                    value=converted_value,
                    product=product,
                    source="TEMPO"
                )
                measurements.append(measurement)
        
        self.logger.info(f"Extracted {len(measurements)} {product.upper()} measurements")
        return measurements
    
    def process_tempo_file(self, file_path: str, product: str) -> List[TempoDataPoint]:
        """
        Process a single TEMPO NetCDF file.
        
        Args:
            file_path: Path to NetCDF file
            product: Product type ('no2' or 'o3')
            
        Returns:
            List of TempoDataPoint objects
        """
        self.logger.info(f"Processing {product.upper()} file: {file_path}")
        
        try:
            # Open NetCDF file
            with xr.open_dataset(file_path) as dataset:
                self.logger.info(f"Opened dataset with variables: {list(dataset.variables.keys())}")
                
                # Find the target variable
                var_name = self._find_variable(dataset, product)
                if not var_name:
                    self.logger.warning(f"No {product.upper()} variable found in {file_path}")
                    return []
                
                # Find coordinate variables
                coords = self._find_coordinates(dataset)
                if not coords.get("latitude") or not coords.get("longitude"):
                    self.logger.error("Missing required coordinates")
                    return []
                
                # Get the data variable
                data_var = dataset[var_name]
                self.logger.info(f"Data variable shape: {data_var.shape}")
                self.logger.info(f"Data variable dims: {data_var.dims}")
                
                # Filter to North America
                filtered_data = self._filter_north_america(
                    data_var, 
                    coords["latitude"], 
                    coords["longitude"]
                )
                
                # Extract measurements
                measurements = self._extract_measurements(filtered_data, coords, product)
                
                return measurements
                
        except Exception as e:
            self.logger.error(f"Error processing {file_path}: {e}")
            return []
    
    def process_all_files(self, download_dir: str = "downloads") -> Dict:
        """
        Process all downloaded TEMPO files.
        
        Args:
            download_dir: Directory containing downloaded files
            
        Returns:
            Dictionary with processing results
        """
        self.logger.info(f"Processing all files in {download_dir}")
        
        results = {
            "products": {"no2": [], "o3": []},
            "total_data_points": 0,
            "files_processed": 0,
            "errors": []
        }
        
        download_path = Path(download_dir)
        if not download_path.exists():
            self.logger.error(f"Download directory does not exist: {download_dir}")
            return results
        
        # Process each product directory
        for product in ["no2", "o3"]:
            product_dir = download_path / product
            if not product_dir.exists():
                self.logger.warning(f"Product directory does not exist: {product_dir}")
                continue
            
            # Process all NetCDF files in the product directory
            nc_files = list(product_dir.glob("*.nc"))
            self.logger.info(f"Found {len(nc_files)} {product.upper()} files")
            
            for nc_file in nc_files:
                try:
                    measurements = self.process_tempo_file(str(nc_file), product)
                    results["products"][product].extend(measurements)
                    results["files_processed"] += 1
                    
                except Exception as e:
                    error_msg = f"Error processing {nc_file}: {e}"
                    self.logger.error(error_msg)
                    results["errors"].append(error_msg)
        
        # Calculate totals
        results["total_data_points"] = len(results["products"]["no2"]) + len(results["products"]["o3"])
        
        self.logger.info(f"Processing complete:")
        self.logger.info(f"  Files processed: {results['files_processed']}")
        self.logger.info(f"  NO2 measurements: {len(results['products']['no2'])}")
        self.logger.info(f"  O3 measurements: {len(results['products']['o3'])}")
        self.logger.info(f"  Total data points: {results['total_data_points']}")
        
        return results

def main():
    """Test the TEMPO processor."""
    import sys
    import os
    
    # Add parent directories to path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Test processor
    processor = TempoProcessor()
    
    # Process all files
    results = processor.process_all_files()
    
    print(f"\nProcessing Results:")
    print(f"  Files processed: {results['files_processed']}")
    print(f"  NO2 measurements: {len(results['products']['no2'])}")
    print(f"  O3 measurements: {len(results['products']['o3'])}")
    print(f"  Total data points: {results['total_data_points']}")
    
    if results['errors']:
        print(f"  Errors: {len(results['errors'])}")
        for error in results['errors']:
            print(f"    - {error}")

if __name__ == "__main__":
    main()
