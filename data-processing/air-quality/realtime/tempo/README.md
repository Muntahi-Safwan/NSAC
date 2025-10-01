# Real-Time Air Quality System

A clean, production-ready system for real-time air quality monitoring using TEMPO satellite data and AirNOW ground measurements.

## 🚀 System Overview

This system provides real-time air quality monitoring by:

- **Downloading** latest TEMPO V4 satellite data (NO2, O3)
- **Processing** NetCDF files to extract measurements
- **Collecting** PM2.5 data from AirNOW
- **Calculating** Air Quality Index (AQI) using EPA standards
- **Storing** data in PostgreSQL database with TimescaleDB

## 📁 Clean System Architecture

```
air-quality/realtime/
├── clean_air_quality_pipeline.py  # Main pipeline orchestrator
├── tempo_downloader.py            # TEMPO satellite data downloader
├── tempo_processor.py             # NetCDF data processor
├── airnow_downloader.py           # AirNOW ground data downloader
├── realtime_aqi_calculator.py     # AQI calculation engine
├── database.py                    # Database operations
├── hourly_tempo_downloader.py     # Hourly data downloader
├── downloads/                     # Downloaded data storage
│   ├── no2/                       # NO2 satellite data
│   └── o3/                        # O3 satellite data
└── README.md                      # This file
```

## 🔧 Core Components

### 1. Clean Air Quality Pipeline (`clean_air_quality_pipeline.py`)

- **Main orchestrator** for the complete workflow
- **Downloads** TEMPO data (NO2, O3)
- **Processes** NetCDF files
- **Collects** AirNOW PM2.5 data
- **Calculates** AQI
- **Stores** results in database

### 2. TEMPO Data Downloader (`tempo_downloader.py`)

- Downloads latest TEMPO V4 satellite data
- Supports NO2 and O3 products
- Uses `earthaccess` library for NASA Earthdata
- Automatically finds most recent data
- Stores files in organized directory structure

### 3. Data Processor (`tempo_processor.py`)

- Processes NetCDF files from TEMPO
- Extracts air quality measurements
- Converts units to standard μg/m³
- Filters to North America coverage
- Handles different data formats

### 4. AirNOW Downloader (`airnow_downloader.py`)

- Downloads PM2.5 data from AirNOW
- Provides ground-based measurements
- Covers United States and Canada
- Hourly updates

### 5. AQI Calculator (`realtime_aqi_calculator.py`)

- Calculates EPA Air Quality Index
- Supports multiple pollutants (PM2.5, NO2, O3, SO2, CO)
- Combines satellite and ground data
- Provides overall AQI and primary pollutant

### 6. Database Operations (`database.py`)

- Stores processed data in PostgreSQL
- Uses TimescaleDB for time-series optimization
- Supports both forecast and real-time data
- Provides efficient querying capabilities

## 🚀 Quick Start

### Run Complete Pipeline

```bash
# Run the full pipeline (download + process + AQI + store)
python clean_air_quality_pipeline.py
```

### Individual Components

```bash
# Download latest TEMPO data
python tempo_downloader.py

# Process downloaded files
python tempo_processor.py

# Download hourly data (more targeted)
python hourly_tempo_downloader.py
```

## 📊 Data Sources

### TEMPO Satellite Data (V4)

- **NO2**: Nitrogen Dioxide from TEMPO_NO2_L2
- **O3**: Ozone from TEMPO_O3TOT_L2
- **Coverage**: North America (15°N-60°N, 130°W-60°W)
- **Frequency**: Near real-time (hourly granules)
- **Resolution**: ~10km x 10km

### AirNOW Ground Data

- **PM2.5**: Particulate Matter from ground stations
- **Coverage**: United States and Canada
- **Frequency**: Hourly updates
- **Resolution**: Point measurements

## 🎯 Key Features

### ✅ Production Ready

- **Clean Architecture**: Separated concerns and modular design
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed logging throughout
- **Database Integration**: PostgreSQL with TimescaleDB
- **Real-time Processing**: Near real-time data processing

### 🔄 Data Flow

1. **Download** latest TEMPO V4 data (NO2, O3)
2. **Process** NetCDF files to extract measurements
3. **Collect** AirNOW PM2.5 data
4. **Combine** satellite and ground data
5. **Calculate** AQI using EPA standards
6. **Store** results in PostgreSQL database

### 📈 Performance Optimizations

- **Smart Downloads**: Downloads only necessary files
- **Batch Processing**: Processes multiple files efficiently
- **Database Indexing**: Optimized for time-series queries
- **Error Recovery**: Continues processing despite individual failures

## 🛠️ Technical Details

### Dependencies

- `earthaccess`: NASA Earthdata access
- `xarray`: NetCDF file processing
- `numpy`: Numerical computations
- `prisma`: Database ORM
- `asyncio`: Asynchronous operations

### Database Schema

- **air_quality_realtime**: Real-time measurements
- **air_quality_forecast**: Forecast data
- **TimescaleDB**: Time-series optimization
- **PostGIS**: Geospatial support

### File Formats

- **Input**: NetCDF4 files from TEMPO V4
- **Output**: PostgreSQL database records
- **Units**: μg/m³ for all pollutants
- **Coordinates**: WGS84 (EPSG:4326)

## 📋 Usage Examples

### Run Complete Pipeline

```python
from clean_air_quality_pipeline import CleanAirQualityPipeline
import asyncio

pipeline = CleanAirQualityPipeline()
results = await pipeline.run_pipeline()
```

### Download TEMPO Data

```python
from tempo_downloader import TempoDownloader

downloader = TempoDownloader()
results = downloader.download_latest_data(['no2', 'o3'])
```

### Process Files

```python
from tempo_processor import TempoProcessor

processor = TempoProcessor()
results = processor.process_all_files()
```

### Calculate AQI

```python
from realtime_aqi_calculator import RealtimeAQICalculator

calculator = RealtimeAQICalculator()
aqi_result = calculator.calculate_realtime_aqi(data_point)
```

## 🔍 Monitoring and Logging

The system provides comprehensive logging:

- **Download Progress**: File sizes, download status
- **Processing Status**: Data extraction, unit conversion
- **Error Handling**: Detailed error messages and recovery
- **Performance Metrics**: Processing times, data volumes

## 🚨 Troubleshooting

### Common Issues

1. **Authentication**: Ensure earthaccess login is configured
2. **File Access**: Check file permissions and disk space
3. **Network**: Verify internet connection for downloads
4. **Database**: Ensure PostgreSQL is running and accessible

### Error Recovery

- **Download Failures**: System retries with different time ranges
- **Processing Errors**: Continues with other files
- **Database Issues**: Logs errors and continues processing

## 📚 Additional Resources

- [TEMPO Mission](https://tempo.si.edu/)
- [NASA Earthdata](https://earthdata.nasa.gov/)
- [EPA AQI Guide](https://www.airnow.gov/aqi/aqi-basics/)
- [TimescaleDB Documentation](https://docs.timescale.com/)

## 🤝 Contributing

This system is designed for real-time air quality monitoring. For improvements or issues:

1. Check the logging output for detailed error information
2. Verify all dependencies are properly installed
3. Ensure database connectivity and permissions
4. Test with smaller datasets first

---

**Status**: ✅ **Production Ready** - Clean, organized system ready for real-time deployment
