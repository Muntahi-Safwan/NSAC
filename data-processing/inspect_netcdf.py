"""
Quick script to inspect available variables in GEOS-CF NetCDF files
Run this to see what pollutants are available
"""

import netCDF4 as nc
import glob
import os

# Find the most recent NetCDF file
files = glob.glob("downloads/*.nc4")
if not files:
    print("❌ No NetCDF files found in ./downloads/")
    print("   Run: python smart_downloader.py first")
    exit(1)

# Use the most recent file
file_path = max(files, key=os.path.getctime)
print(f"📂 Inspecting: {file_path}\n")

# Open and inspect
with nc.Dataset(file_path, 'r') as dataset:
    print("=" * 70)
    print("AVAILABLE VARIABLES")
    print("=" * 70)
    
    for var_name in dataset.variables.keys():
        var = dataset.variables[var_name]
        print(f"\n{var_name}:")
        print(f"  Shape: {var.shape}")
        print(f"  Dimensions: {var.dimensions}")
        if hasattr(var, 'long_name'):
            print(f"  Description: {var.long_name}")
        if hasattr(var, 'units'):
            print(f"  Units: {var.units}")
    
    print("\n" + "=" * 70)
    print("DIMENSIONS")
    print("=" * 70)
    for dim_name, dim in dataset.dimensions.items():
        print(f"{dim_name}: {len(dim)}")
    
    print("\n" + "=" * 70)
    print("GLOBAL ATTRIBUTES")
    print("=" * 70)
    for attr_name in dataset.ncattrs():
        print(f"{attr_name}: {dataset.getncattr(attr_name)}")

