# 🌍 NSAC Data Processing Pipeline

Modular data processing system for collecting and analyzing environmental data.

## 📁 Directory Structure

```
data-processing/
├── aqi/                    # Air Quality Index data processing
│   ├── main.py            # AQI data collection pipeline
│   ├── smart_downloader.py # GEOS-CF file downloader
│   ├── data_processor.py  # NetCDF data processor
│   ├── inspect_netcdf.py  # NetCDF file inspector
│   ├── calculator.py      # AQI calculator
│   ├── breakpoints.py     # EPA AQI breakpoints
│   └── README.md          # AQI-specific documentation
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATA_COLLECTION_STRATEGY.md
│   └── ... (other docs)
├── downloads/             # Downloaded data files
├── database.py           # Global database connection
├── schema.prisma         # Global database schema
├── requirements.txt      # Global dependencies
├── Dockerfile           # Container setup
├── docker-compose.yml   # Container orchestration
└── env.example          # Environment template
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment template
copy env.example .env
# Edit .env with your database credentials
```

### 2. Run with Docker (Recommended)

```bash
# Build and run AQI data collection
docker-compose run --rm data-pipeline
```

### 3. Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run AQI pipeline
cd aqi
python main.py
```

## 📊 Available Data Processing Units

### 🌬️ AQI (Air Quality Index)

- **Location**: `aqi/`
- **Data Source**: GEOS-CF forecast data
- **Coverage**: North America (TEMPO satellite coverage)
- **Parameters**: PM2.5, NO2, O3, SO2, CO, HCHO
- **Output**: Air Quality Index calculations

### 🔥 Wildfire (Planned)

- **Location**: `wildfire/` (future)
- **Data Source**: TBD
- **Coverage**: TBD

### 🌡️ Heatwave (Planned)

- **Location**: `heatwave/` (future)
- **Data Source**: TBD
- **Coverage**: TBD

## 🛠️ Development

### Adding New Data Processing Units

1. Create new subfolder (e.g., `wildfire/`)
2. Implement required files:
   - `main.py` - Main pipeline
   - `downloader.py` - Data downloader
   - `processor.py` - Data processor
   - `README.md` - Unit documentation
3. Update global `schema.prisma` if new database tables needed
4. Add to `docker-compose.yml` if containerization needed

### Global Files

- **`database.py`** - Shared database connection and utilities
- **`schema.prisma`** - Database schema (shared across all units)
- **`requirements.txt`** - Python dependencies
- **`Dockerfile`** - Container configuration
- **`docker-compose.yml`** - Container orchestration

## 📚 Documentation

See `docs/` folder for detailed documentation:

- `ARCHITECTURE.md` - System architecture
- `DATA_COLLECTION_STRATEGY.md` - Data collection strategy
- `DOCKER_README.md` - Docker setup guide

## 🔧 Configuration

Environment variables (see `env.example`):

- Database connection settings
- API keys and credentials
- Processing parameters


