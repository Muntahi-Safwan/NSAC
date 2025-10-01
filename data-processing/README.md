# 🌍 Air Quality Data Collection System

A comprehensive system for collecting, processing, and storing air quality data from NASA's GEOS-CF model for North America.

## 📁 Project Structure

```
data-processing/
├── air-quality/              # Main air quality system
│   ├── main.py              # System orchestrator
│   ├── forecast/            # Forecast data collection
│   │   ├── data_processor.py
│   │   ├── database.py
│   │   ├── smart_downloader.py
│   │   └── downloads/       # Forecast data files
│   ├── realtime/            # Real-time data collection
│   │   ├── data_processor.py
│   │   ├── database.py
│   │   ├── smart_downloader.py
│   │   ├── downloads/       # Analysis data files
│   │   └── tempo/           # TEMPO system (future)
│   └── shared/              # Shared components
│       ├── breakpoints.py   # AQI breakpoints
│       └── calculator.py    # AQI calculator
├── scripts/                 # Management scripts
│   ├── run_hourly_collection.py  # Hourly scheduler
│   └── manage_services.py        # Service management
├── docs/                    # Documentation
│   └── atmospheric_levels_explanation.md
├── logs/                    # Log files (created automatically)
├── docker-compose.yml       # Docker services configuration
├── Dockerfile              # Docker image definition
├── schema.prisma           # Database schema
├── requirements.txt        # Python dependencies
└── .env                    # Environment configuration
```

## 🚀 Quick Start

### 1. Start the Database

```bash
docker-compose up -d postgres
```

### 2. Start the Scheduler (Automatic Hourly Collection)

```bash
python scripts/manage_services.py start-scheduler
```

### 3. Access Prisma Studio (Optional)

```bash
python scripts/manage_services.py start-studio
# Access at: http://localhost:5555
```

## 📊 Data Collection

### **Real-Time Data (Analysis)**

- **Source**: GEOS-CF Analysis Data (NASA)
- **Frequency**: Every hour
- **Coverage**: North America (15°N to 60°N, 130°W to 60°W)
- **Pollutants**: PM2.5, NO2, O3, SO2, CO, HCHO

### **Forecast Data**

- **Source**: GEOS-CF Forecast Data (NASA)
- **Frequency**: Daily (00Z and 12Z runs)
- **Coverage**: Same as real-time
- **Pollutants**: Same as real-time

## 🗄️ Database Schema

### **Real-Time Table** (`air_quality_realtime`)

- Surface level (level=0) air quality measurements
- Source: `GEOS-CF-ANALYSIS`
- Hourly updates

### **Forecast Table** (`air_quality_forecast`)

- Forecast air quality predictions
- Source: `GEOS-CF-FORECAST`
- Daily updates

## 🔧 Service Management

### **Available Commands**

```bash
# Start services
python scripts/manage_services.py start-scheduler    # Start hourly collection
python scripts/manage_services.py start-studio       # Start Prisma Studio
python scripts/manage_services.py start-all          # Start both

# Stop services
python scripts/manage_services.py stop-scheduler     # Stop collection
python scripts/manage_services.py stop-studio        # Stop Prisma Studio
python scripts/manage_services.py stop-all           # Stop both

# Monitor services
python scripts/manage_services.py status             # Show service status
python scripts/manage_services.py logs               # Show recent logs
```

### **Manual Data Collection**

```bash
# Run real-time collection once
docker-compose run --rm --no-deps data-pipeline python air-quality/main.py realtime

# Run forecast collection once
docker-compose run --rm --no-deps data-pipeline python air-quality/main.py forecast

# Run both (daily collection)
docker-compose run --rm --no-deps data-pipeline python air-quality/main.py daily
```

## 📈 Monitoring

### **Logs**

- Scheduler logs: `logs/air_quality_scheduler_YYYYMMDD.log`
- System logs: `logs/air_quality_main.log`

### **Database Access**

- **Prisma Studio**: http://localhost:5555
- **Direct PostgreSQL**: localhost:5432
- **Database**: airquality

### **Service Status**

```bash
python scripts/manage_services.py status
```

## 🎯 Key Features

- ✅ **Automated Collection**: Runs every hour without intervention
- ✅ **Smart Scheduling**: Aligns with hour boundaries
- ✅ **Error Handling**: Comprehensive logging and recovery
- ✅ **Data Validation**: Quality checks and duplicate prevention
- ✅ **Geographic Coverage**: Full North American coverage
- ✅ **Multiple Pollutants**: PM2.5, NO2, O3, SO2, CO, HCHO
- ✅ **AQI Calculation**: Standardized air quality index
- ✅ **Docker-Based**: Containerized for easy deployment
- ✅ **Database Management**: Modern PostgreSQL with TimescaleDB

## 🔮 Future Enhancements

- **TEMPO Integration**: Real-time satellite data from TEMPO
- **Multi-Level Data**: Atmospheric levels beyond surface
- **API Endpoints**: REST API for data access
- **Web Dashboard**: Real-time visualization
- **Alert System**: Air quality alerts and notifications

## 🛠️ Development

### **Adding New Pollutants**

1. Update `schema.prisma` with new pollutant field
2. Update data processors to extract new data
3. Run `docker-compose run --rm --no-deps data-pipeline python -m prisma db push`

### **Modifying Collection Frequency**

1. Edit `scripts/run_hourly_collection.py`
2. Adjust the sleep interval in `scheduler_loop()`

### **Adding New Data Sources**

1. Create new downloader in appropriate folder
2. Update main system to include new source
3. Add database schema if needed

## 📞 Support

For issues or questions:

1. Check logs in `logs/` directory
2. Verify service status with `python scripts/manage_services.py status`
3. Review Docker container logs: `docker-compose logs <service-name>`

---

**🌍 Monitoring North American Air Quality with NASA GEOS-CF Data**
