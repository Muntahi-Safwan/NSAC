# Heatwave Prediction System

A comprehensive 5-day heatwave prediction system that downloads NASA GEOS-CF meteorological data, processes it, and generates advanced heatwave alerts.

## 🚀 Features

- **5-Day Forecasting**: Downloads and processes 120+ hourly meteorological files
- **Real-Time Processing**: Download → Process → Store → Delete (memory efficient)
- **Advanced Heatwave Detection**: Regional thresholds, heat index calculations, duration analysis
- **Automated Forecast Detection**: Finds latest available NASA GEOS-CF data
- **Database Integration**: Stores meteorological data and heatwave alerts
- **Geographic Coverage**: TEMPO satellite area (North America)

## 📁 File Structure

### Core Components

- **`main.py`** - Main pipeline orchestrator (5-day sequential processing)
- **`heatwave_calculator.py`** - Advanced heatwave detection and analysis
- **`simplified_database.py`** - Database operations for meteorological data and alerts
- **`smart_downloader.py`** - NASA GEOS-CF data downloader with optimizations
- **`meteorological_processor.py`** - NetCDF file processing and data extraction

### Supporting Modules

- **`geographic_filters.py`** - TEMPO satellite coverage area filtering
- **`temperature_thresholds.py`** - Regional temperature thresholds
- **`climate_data.py`** - Climate and geographic data utilities

### Directories

- **`downloads/`** - Temporary storage for downloaded NetCDF files (auto-cleaned)

## 🏃‍♂️ Usage

### Basic Usage

```bash
cd data-processing
docker-compose run --rm data-pipeline python heatwave/main.py
```

### With Custom Settings

```bash
# High sample rate for faster processing
docker-compose run --rm data-pipeline python heatwave/main.py --sample-rate 10

# Specific target date
docker-compose run --rm data-pipeline python heatwave/main.py --target-date 2025-10-05
```

## 📊 Output

The system processes:

- **120+ hourly meteorological files** across 5 days
- **Meteorological data** stored in real-time
- **5 days of heatwave alerts** with detailed analysis
- **Memory efficient** processing (files deleted after processing)

## 🔥 Heatwave Detection

### Alert Levels

- **Level 0**: No risk
- **Level 1**: Watch (hot conditions, limit outdoor exposure)
- **Level 2**: Warning (dangerous heat, avoid outdoor activities)
- **Level 3**: Emergency (extreme heat danger, seek immediate shelter)

### Analysis Features

- **Regional Adaptation**: Different thresholds for different climate zones
- **Heat Index**: Accounts for humidity in temperature perception
- **Duration Analysis**: Tracks consecutive hot hours
- **Nighttime Recovery**: Considers cooling patterns
- **Geographic Coverage**: TEMPO satellite area (North America)

## 🗄️ Database Schema

### Tables

- **`meteorological_data`** - Hourly meteorological records
- **`heatwave_alerts`** - Daily heatwave alerts with analysis

### Data Flow

1. Download NetCDF files from NASA GEOS-CF
2. Process and extract meteorological data
3. Store hourly data in `meteorological_data` table
4. Analyze data for heatwave conditions
5. Generate and store daily alerts in `heatwave_alerts` table

## 🛠️ Technical Details

- **Data Source**: NASA GEOS-CF meteorological forecasts
- **File Format**: NetCDF4 (.nc4)
- **Database**: PostgreSQL with Prisma ORM
- **Processing**: Sequential (memory efficient)
- **Coverage**: North America (TEMPO satellite area)
- **Sample Rate**: Configurable (default: every 5th grid point)

## 📈 Performance

- **Memory Efficient**: Files processed one by one
- **VPS Friendly**: Single-threaded downloads
- **Robust**: Retry logic and error handling
- **Scalable**: Configurable sample rates
- **Real-Time**: Immediate data storage and analysis
