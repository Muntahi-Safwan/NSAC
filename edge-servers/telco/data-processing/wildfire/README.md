# Wildfire Detection System

A system to download and process the latest fire detection data from NASA and store it in the database.

## 🔥 Features

- **Real-time Fire Detection**: Downloads latest NASA VIIRS active fire data
- **Optimized Data Source**: VIIRS Suomi NPP/NOAA-20 (best for real-time monitoring)
- **Geographic Filtering**: Focus on North America (TEMPO coverage area)
- **Database Integration**: Stores fire detection data with metadata
- **Automated Processing**: Downloads, processes, and stores fire data automatically
- **Duplicate Avoidance**: Prevents storing redundant data from hourly updates

## 📁 File Structure

### Core Components

- **`main.py`** - Main wildfire pipeline orchestrator
- **`fire_downloader.py`** - NASA fire data downloader
- **`fire_processor.py`** - Fire data processing and filtering
- **`fire_database.py`** - Database operations for fire data
- **`geographic_filters.py`** - Geographic filtering utilities

### Directories

- **`downloads/`** - Temporary storage for downloaded fire data files

## 🚀 Usage

### Basic Usage

```bash
cd data-processing
docker-compose run --rm data-pipeline python wildfire/main.py
```

### With Custom Settings

```bash
# Download specific date range
docker-compose run --rm data-pipeline python wildfire/main.py --days-back 7

# Download specific satellite (VIIRS is default)
docker-compose run --rm data-pipeline python wildfire/main.py --satellite VIIRS
```

## 📊 Data Sources

### NASA Fire Data Sources

- **VIIRS Suomi NPP**: Multiple daily fire detections (optimized for real-time monitoring)
- **VIIRS NOAA-20**: Multiple daily fire detections (optimized for real-time monitoring)

**Why VIIRS Only?**

- **Better temporal resolution**: Multiple passes per day vs. twice daily for MODIS
- **Improved detection**: Better at detecting smaller fires
- **Real-time optimization**: More frequent updates for hourly cron jobs
- **Simplified architecture**: Single data source reduces complexity

### Data Format

- **CSV/Text files** with fire detection coordinates
- **Latitude/Longitude** coordinates
- **Confidence levels** (nominal, low, high)
- **Fire radiative power** (FRP) measurements
- **Detection time** and satellite information

## 🗄️ Database Schema

### Tables

- **`fire_detections`** - Individual fire detection records
- **`fire_summaries`** - Daily fire summary statistics

### Data Flow

1. Download fire detection files from NASA
2. Process and filter data for North America
3. Store individual fire detections in `fire_detections` table
4. Generate daily summaries in `fire_summaries` table

## 🛠️ Technical Details

- **Data Source**: NASA FIRMS (Fire Information for Resource Management System)
- **File Format**: CSV/Text files
- **Update Frequency**: Multiple times daily (VIIRS satellites)
- **Coverage**: Global (filtered to North America)
- **Processing**: Real-time download and processing
- **Storage**: PostgreSQL with Prisma ORM

## 📈 Performance

- **Memory Efficient**: Processes files as they download
- **VPS Friendly**: Single-threaded downloads
- **Robust**: Retry logic and error handling
- **Scalable**: Configurable date ranges (VIIRS optimized)
- **Real-Time**: Immediate data storage and processing
