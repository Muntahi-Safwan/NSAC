# 📋 Project Overview - NASA Space Apps Challenge 2025

## 🎯 Mission

Building a comprehensive **Air Quality Monitoring and Forecasting System** that combines satellite data, ground measurements, and predictive models to provide real-time air quality insights for North America.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NASA GEOS-CF Forecasts                    │
│              (PM2.5, NO2, O3, SO2, CO predictions)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Data Pipeline        │
         │  (Python + NetCDF)    │
         │  - Download forecasts │
         │  - Process & convert  │
         │  - Filter to TEMPO    │
         └──────────┬────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │   PostgreSQL Database   │
         │   + PostGIS             │
         │   + TimescaleDB         │
         │   (Docker container)    │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │   Backend API          │
         │   (Node.js + Express)  │
         │   - Location queries   │
         │   - Time-series data   │
         │   - AQI calculation    │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │   Frontend UI          │
         │   (React + TypeScript) │
         │   - Interactive maps   │
         │   - Real-time display  │
         │   - Forecasts & trends │
         └────────────────────────┘
```

---

## 📦 Project Structure

```
NSAC/
│
├── database/                    # 🐳 Docker PostgreSQL setup
│   ├── docker-compose.yml      # Container configuration
│   ├── init-scripts/           # Auto-run on first start
│   ├── .env.template           # Configuration template
│   ├── QUICKSTART.md           # 5-minute setup guide
│   ├── README.md               # Complete database docs
│   ├── SETUP_PROCESS.md        # Step-by-step walkthrough
│   └── WINDOWS_SETUP.md        # Windows-specific guide
│
├── data-processing/            # 🌍 Air quality data pipeline
│   ├── main_pipeline.py        # Main orchestrator
│   ├── smart_downloader.py     # GEOS-CF file downloader
│   ├── data_processor.py       # NetCDF processor (with unit conversions)
│   ├── database.py             # Database operations
│   ├── schema.prisma           # Database schema
│   ├── requirements.txt        # Python dependencies
│   ├── inspect_netcdf.py       # NetCDF inspection tool
│   │
│   ├── FINAL_SETUP_SUMMARY.md  # Complete setup guide
│   ├── DATA_COLLECTION_STRATEGY.md  # Strategy & rationale
│   ├── UNIT_CONVERSIONS.md     # Unit conversion details
│   └── downloads/              # Downloaded NetCDF files (gitignored)
│
├── frontend/                   # ⚛️ React web application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   └── routes/            # Routing configuration
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # 🚀 Node.js API server
│   ├── src/
│   │   └── server.js
│   └── package.json
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Main project documentation
└── PROJECT_OVERVIEW.md         # This file
```

---

## 🔬 Data Collection

### Current Implementation (Phase 1)

**Source:** NASA GEOS-CF (Goddard Earth Observing System - Composition Forecast)

**Pollutants Collected:**

1. **PM2.5** - Particulate Matter < 2.5μm (μg/m³)
2. **NO2** - Nitrogen Dioxide (converted from mol/mol to μg/m³)
3. **O3** - Ozone (converted from mol/mol to μg/m³)
4. **SO2** - Sulfur Dioxide (converted from mol/mol to μg/m³)
5. **CO** - Carbon Monoxide (converted from mol/mol to μg/m³)

**Geographic Coverage:**

- Filtered to TEMPO satellite coverage area
- North America: 15°N - 60°N, -130°W - -60°W
- ~70% data reduction vs global coverage

**Update Frequency:**

- GEOS-CF updates: Every 12 hours (00z and 12z)
- Pipeline can run: Hourly or on-demand
- Forecast horizon: 24 hours ahead

### Future Phases

**Phase 2:** TEMPO Satellite Integration

- Real-time atmospheric observations
- NO2, O3, SO2, HCHO measurements
- Hourly daytime coverage

**Phase 3:** AirNow Ground Stations

- Real-time PM2.5 from monitoring stations
- Ground truth for validation
- Comprehensive pollutant data

---

## 💾 Database Design

### Technology Stack

- **PostgreSQL 16** - Relational database
- **PostGIS** - Geospatial queries and indexing
- **TimescaleDB** - Time-series optimization
- **Prisma** - Type-safe ORM for Python

### Schema Highlights

```sql
air_quality_forecasts (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP,         -- Forecast valid time
  forecast_init_time TIMESTAMP, -- When forecast was made
  latitude FLOAT,
  longitude FLOAT,
  level FLOAT,                 -- Atmospheric level

  -- Pollutants (all in μg/m³ after conversion)
  pm25 FLOAT,
  no2 FLOAT,
  o3 FLOAT,
  so2 FLOAT,
  co FLOAT,
  hcho FLOAT,

  source VARCHAR,
  created_at TIMESTAMP
)
```

**Key Features:**

- Spatial indexes for location-based queries
- Time-based indexes for temporal queries
- Composite indexes for combined geo-temporal searches
- Nullable pollutants for flexibility

---

## 🔄 Data Flow

### 1. Download Phase

```
NASA GEOS-CF Server → smart_downloader.py → downloads/*.nc4
```

### 2. Processing Phase

```
NetCDF file → data_processor.py
  ├─ Extract pollutant data
  ├─ Convert units (mol/mol → μg/m³)
  ├─ Filter to TEMPO coverage
  └─ Sample every Nth point
```

### 3. Storage Phase

```
Processed data → database.py → PostgreSQL
  ├─ Batch insertions (1000 records/batch)
  ├─ Duplicate checking
  └─ Transaction management
```

### 4. Query Phase (Future)

```
Backend API → Prisma ORM → PostgreSQL
  ├─ Location-based queries
  ├─ Time-series retrieval
  └─ AQI calculation
```

---

## 🎯 Key Features

### ✅ Implemented

- [x] Docker-based PostgreSQL setup
- [x] Multi-pollutant data collection
- [x] Automatic unit conversions
- [x] TEMPO coverage filtering
- [x] Configurable sampling rates
- [x] Batch database insertions
- [x] Comprehensive documentation

### 🔄 In Progress

- [ ] Backend API development
- [ ] Frontend visualization
- [ ] AQI calculation algorithms

### 📋 Planned

- [ ] TEMPO satellite data integration
- [ ] AirNow ground station data
- [ ] Real-time vs forecast comparison
- [ ] Alert system for poor air quality
- [ ] Historical trend analysis
- [ ] Predictive modeling improvements

---

## 🚀 Quick Start

### For Team Members

**Windows:**

```cmd
# 1. Clone repo
git clone https://github.com/Muntahi-Safwan/NSAC.git
cd NSAC

# 2. Setup database
cd database
copy .env.template .env
docker-compose up -d postgres

# 3. Setup pipeline
cd ..\data-processing
pip install -r requirements.txt
prisma generate
prisma db push

# 4. Run pipeline
python main_pipeline.py
```

**Detailed Guides:**

- **Windows Users:** See `database/WINDOWS_SETUP.md`
- **Quick Setup:** See `database/QUICKSTART.md`
- **Complete Guide:** See `data-processing/FINAL_SETUP_SUMMARY.md`

---

## 📊 Current Status

### Completion Progress

| Component               | Status         | Progress |
| ----------------------- | -------------- | -------- |
| Database Infrastructure | ✅ Complete    | 100%     |
| Data Pipeline           | ✅ Complete    | 100%     |
| Documentation           | ✅ Complete    | 100%     |
| Backend API             | ⏳ Not Started | 0%       |
| Frontend UI             | ⏳ Not Started | 0%       |
| AQI Calculation         | ⏳ Not Started | 0%       |
| Deployment              | ⏳ Not Started | 0%       |

**Overall Progress:** ~35% (Foundation complete, application layer pending)

---

## 🧪 Testing & Validation

### Data Quality Checks

```bash
# Inspect NetCDF files
python inspect_netcdf.py

# Verify database records
docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "SELECT COUNT(*) FROM air_quality_forecasts;"

# Check pollutant availability
SELECT
  COUNT(*) as total,
  COUNT(pm25) as has_pm25,
  COUNT(no2) as has_no2,
  COUNT(o3) as has_o3
FROM air_quality_forecasts;
```

---

## 🤝 Team Collaboration

### Git Workflow

1. **Clone repository**
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Make changes and commit**
4. **Push to GitHub:** `git push origin feature/your-feature`
5. **Create Pull Request**

### What NOT to Commit

- `.env` files (contains credentials)
- `downloads/*.nc4` (large data files)
- `node_modules/` (dependencies)
- `__pycache__/` (Python cache)
- `.prisma/` (generated files)

**All properly configured in `.gitignore`**

---

## 📚 Documentation Index

| Document                                      | Purpose                           | Audience      |
| --------------------------------------------- | --------------------------------- | ------------- |
| `README.md`                                   | Project overview                  | Everyone      |
| `PROJECT_OVERVIEW.md`                         | This file - architecture & status | Team members  |
| `database/QUICKSTART.md`                      | 5-minute database setup           | New users     |
| `database/README.md`                          | Complete database guide           | Developers    |
| `database/WINDOWS_SETUP.md`                   | Windows-specific commands         | Windows users |
| `data-processing/FINAL_SETUP_SUMMARY.md`      | Complete pipeline guide           | Developers    |
| `data-processing/DATA_COLLECTION_STRATEGY.md` | Strategy & rationale              | Team leads    |
| `data-processing/UNIT_CONVERSIONS.md`         | Technical conversion details      | Scientists    |

---

## 🎓 Learning Resources

### NASA Data Sources

- [GEOS-CF Documentation](https://gmao.gsfc.nasa.gov/GEOS_systems/geos-cf.php)
- [TEMPO Mission](https://tempo.si.edu/)
- [NASA Earthdata](https://www.earthdata.nasa.gov/)

### Technologies Used

- [PostgreSQL](https://www.postgresql.org/docs/)
- [PostGIS](https://postgis.net/documentation/)
- [TimescaleDB](https://docs.timescale.com/)
- [Docker](https://docs.docker.com/)
- [Prisma](https://www.prisma.io/docs)
- [NetCDF](https://www.unidata.ucar.edu/software/netcdf/)

---

## 🏆 NASA Space Apps Challenge 2025

**Team:** Muntahi Safwan  
**Challenge:** Air Quality Monitoring & Prediction  
**Approach:** Multi-source data fusion with satellite forecasts, real-time observations, and ground truth

---

**Last Updated:** September 30, 2025  
**Version:** 1.0 - Foundation Complete
