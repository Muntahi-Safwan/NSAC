# 🌍 AiroWatch - NASA Space Apps Challenge 2025

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue?style=for-the-badge&logo=nasa)](https://spaceapps.nasa.gov)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)

<div align="center">
  <img src="banner.png" alt="AiroWatch Banner" width="100%" />
</div>

## 🔗 Live Demo

**🚀 [View Live Application](https://airowatch.vercel.app/)**

**📺 [View Youtube Video](https://youtu.be/W3XtWG64tjw)**

---

## 🚀 Overview

**AiroWatch** is a innovative platform built for the NASA Space Apps Challenge, designed to transform powerfull Earth science data into life-saving, actionable intelligence. By leveraging NASA’s GEOS Analysis data, FIRMS fire detection data, and selected TEMPO data from Worldview, we create clear, personalized insights about heatwaves, pollution, and wildfires—critical hazards affecting millions worldwide.

Instead of presenting raw scientific numbers, AiroWatch processes most of the data through AI services, generating insights in easy-to-understand formats such as text, audio, and video. This ensures that vulnerable communities, NGOs, and local authorities can quickly comprehend risks and take action.

Our delivery system is scalable and inclusive: alerts are distributed via web as well as telco networks, ground and satellite radio, and television edge servers—ensuring access even in low-connectivity areas.

AiroWatch goes beyond warnings. By simplifying science into actionable guidance, we empower communities to protect themselves, respond faster to hazards, and adopt more sustainable practices, building a safer, healthier, and more resilient future powered by NASA data.

## ✨ Core Features

### 🗺️ Air Quality Dashboard

- Real-time monitoring of PM2.5, NO₂, O₃, SO₂, CO
- AQI speedometer & 7-day trend charts
- Interactive maps with regional pollutant layers
- Live updates

### 🔥 Wildfire Tracking

- Real-time NASA FIRMS fire data
- Fire intensity & confidence metrics
- 48-hour detection window
- Automatic alerts for high-risk fires

### 🌡️ Heatwave Prediction

- 5-day forecast using NASA MODIS & VIIRS data
- Risk levels: Critical, High, Medium, Low
- Humidity-adjusted risk assessment
- Location-specific alerts

### 🤖 AI Integration

- Context-aware chatbot powered by GROQ AI
- Personalized tips & actionable insights
- AI-generated quizzes and interactive feedback
- Multi-format responses: text, audio, visuals

### 🚨 Emergency Response Portal

- NGO dashboard for user tracking & alerts
- Mass notifications by region
- Real-time safety tracking
- Alert history & severity classification

### 👤 Personal Safety Dashboard

- Mark yourself Safe / Need Help
- GPS location sharing during emergencies
- Health profile & emergency contacts
- Simulation & practice scenarios

### 🖥️ Edge Servers (Telco, Radio, TV)

- Fully independent servers with local database
- Ultra-low latency (<1s) alerts locally
- Multi-channel delivery: SMS, radio, TV
- Continue operating even if central cloud fails
- Scalable: add unlimited edge servers to expand coverage

### 📊 Analytics & Learning

- Real-time stats for AQI, heatwaves, wildfires
- Interactive charts and regional analysis
- Learning hub: articles, guides, and AI quizzes
- Emergency simulation training for preparedness

## ☁️ Central System Architecture

The **Central System** serves as the backbone of AiroWatch, coordinating data ingestion, processing, and management across all regions and edge servers. It is designed for **scalability, reliability, and seamless integration** with NASA data sources and AI services.

#### 1️⃣ Components Overview

- **Central Database**

  - Stores all user profiles, sensitive group information, historical environmental data, and alerts.
  - Acts as the source of truth for edge servers, providing periodic synchronization.
  - Built on **PostgreSQL** for better scalability.

- **Data Processing Pipelines**

  - Fetches data from NASA satellites (MODIS, VIIRS, TEMPO, FIRMS, GEOS-CF) in near real-time.
  - Processes raw data into actionable insights for air quality, heatwaves, and wildfires.
  - Generates structured datasets for the central system and edge servers.

- **Backend API**

  - RESTful API built on **Node.js/Express**.
  - Serves data to the frontend, edge servers, and NGOs.
  - Handles user authentication, access control, and alert distribution rules.
  - Connects to external **AI services** for generating contextual alerts and personalized messaging.

- **Frontend Dashboard**

  - Interactive dashboards for public users, NGOs, and emergency responders.
  - Real-time visualization of air quality, wildfire tracking, heatwave predictions, and alerts.
  - Built with **React** and **Tailwind CSS** for responsive and modern interfaces.

- **Alert Management System**
  - Prepares alerts to be sent via edge servers.
  - Maintains logs of all alert deliveries and historical notifications.
  - Supports multi-channel delivery through edge servers: SMS, voice, audio, and video.

#### 2️⃣ Data Flow

1. **Data Ingestion**: Central system collects raw satellite data and sensor inputs (Will be added soon).
2. **Processing & Aggregation**: Data is cleaned, structured, and analyzed to generate actionable insights.
3. **Storage**: Processed data stored in central database and synchronized with edge servers.
4. **Alert Generation**: AI services generate contextual messages based on processed data and user profiles.
5. **Distribution**: Alerts sent to edge servers, which deliver them via their respective channels (SMS, voice, audio, video).

#### 3️⃣ Key Advantages

- **Scalable & Modular**: New regions, users, and edge servers can be added without downtime.
- **Centralized Data Control**: Maintains a single source of truth for sensitive data and historical insights.
- **Seamless Edge Integration**: Edge Servers can get already processed data saving processing power.
- **AI-Enhanced Insights**: Uses external AI services to transform complex satellite data into easy-to-understand alerts.
- **High Availability**: Designed for redundancy, automated backups, and fault-tolerant operation.

## 🖥️ Edge Servers Architecture

Our system includes three types of **Edge Servers**, each designed to operate autonomously, process data locally, and deliver AI-powered alerts through different channels.

#### 1️⃣ General Structure

- **Fully Dockerized**: Each edge server runs as a self-contained Docker image.
- **Components**:
  - **Local Database**: Stores regional data and sensitive user information synced from the central database.
  - **Data Processor**: Fetches NASA data in real-time, processes it locally when central server is not, and generates actionable insights.
  - **AI Services Integration**: Connects to external AI APIs to generate context-aware, personalized alerts for each user.

#### 2️⃣ Telco Edge Server

- **Delivery Channels**: SMS & Voice Calls.
- **Personalization**: Uses local database of sensitive groups for highly contextual messages.
- **Alerts**: AI-generated notifications about air quality, heatwaves, and wildfires delivered instantly.

#### 3️⃣ Radio Edge Server

- **Delivery Channels**: Audio broadcasts.
- **Alerts**: AI-generated contextual audio updates that can operate even in low-connectivity areas.

#### 4️⃣ TV Edge Server

- **Delivery Channels**: Video alerts.
- **Alerts**: AI-generated visual updates including overlays, full-screen alerts, or crawlers for easy comprehension.

#### 5️⃣ Key Advantages

- **Decentralized & Autonomous**: Functions independently from central cloud.
- **Contextual & Personalized**: Alerts consider sensitive user groups and local conditions.
- **Multi-Channel Delivery**: Reaches users via SMS, audio, and video.
- **Resilient & Scalable**: Continues operating even if the central cloud fails; additional edge servers can be added to expand coverage.

## Tech Stack

#### 🎨 Frontend Technologies

- **React 19.1.1** – Modern UI framework with React Compiler for optimal performance

- **TypeScript 5.8.3** – Type-safe development with strict typing

- **Tailwind CSS 4.1.13** – Utility-first CSS framework for responsive design

- **Vite 7.1.7** – Fast build tool and development server

- **React Router 7.9.3** – Client-side routing with protected routes

- **Leaflet** – Interactive map library for geospatial visualizations

- **Recharts 3.2.1** – Composable charting library for data visualization

- **Axios 1.12.2** – Promise-based HTTP client for API calls

- **Lucide React** – Consistent icon library

- **Radix UI** – Accessible, unstyled component primitives

- **React Markdown** – Markdown rendering with GitHub-flavored markdown support

### ⚙️ Backend Technologies

- **Node.js 20+** – JavaScript runtime environment

- **Express.js 5.1.0** – Minimalist web framework

- **Prisma 6.16.2** – Type-safe database ORM

- **PostgreSQL 16** – Primary relational database

- **JWT (jsonwebtoken 9.0.2)** – Secure authentication tokens

- **bcryptjs 3.0.2** – Password hashing and salting

- **GROQ AI API** – External AI services for insights and chatbot

- **Express Validator 7.2.1** – Input validation middleware

### 🐍 Data Processor

- **Python 3.8+** – Data processing and analysis

- **NetCDF4** – Reading NASA satellite files

- **NumPy** – Numerical computing

- **Pandas** – Data manipulation and analysis

- **Prisma Python** – Type-safe database ORM

- **Requests** – API calls to NASA services

- **Cron Scheduler** – Automated hourly data collection

### 🛢️ Database & Infrastructure

- **PostgreSQL 16** – Central and edge server databases

- **Docker & Docker Compose** – Containerized deployment for all servers

- **Prisma Schema** – Database modeling with migrations

### ☁️ Deployment & DevOps

- **Docker** – Container platform

- **AWS ECS/Fargate** – Optional cloud orchestration

- **AWS ECR** – Docker container registry

- **AWS Secrets Manager** – Secure credential storage

- **Application Load Balancer** – Traffic distribution and health checks

- **CloudWatch** – Logging, monitoring, and metrics

### 🛠️ Development Tools

- **ESLint 9.36.0** – Code linting

- **TypeScript ESLint** – TypeScript-specific linting

- **Babel React Compiler** – Optimized React compilation

- **Git & GitHub** – Version control and collaboration

- **Prisma Studio** – Database GUI

## 🚀 Getting Started

### Prerequisites

#### Required Software

- **Docker** - For deployment ([Download](https://www.docker.com/products/docker-desktop))
- **Python 3.8+** - For data processing pipelines ([Download](https://www.python.org/downloads/))
- **Node.js 20+** - For frontend and backend ([Download](https://nodejs.org/))
- **Git** - Version control system ([Download](https://git-scm.com/))

#### API Keys (Required)

- **NASA API Key** - Get from [NASA API Portal](https://api.nasa.gov/)
- **GROQ AI API Key** - Get from [GROQ Console](https://console.groq.com/)

### Installation

#### Clone the Repository

```bash
git clone https://github.com/Muntahi-Safwan/NSAC.git
cd NSAC
```

#### Setup Database with Docker

```bash
cd database

# Windows
copy .env.template .env

# Linux/Mac
cp .env.template .env

# Edit .env file with your database credentials
# Start PostgreSQL container
docker-compose up -d database
```

#### Setup Data Processing Pipeline

```bash
# Copy the template
cp env.example .env

# Edit .env if needed
# Build the docker image
docker build -t data-processor .
```

#### Setup Backend API

```bash
cd ../backend

# Install dependencies
npm install

# Create .env file with required variables:
# DATABASE_URL=postgresql://user:password@localhost:5432/airquality
# JWT_SECRET=your-secret-key
# GROQ_API_KEY=your-groq-api-key
# NASA_API_KEY=your-nasa-api-key

# Generate Prisma client
npm run prisma:generate

# Push database schema
npm run prisma:push
```

📚 **Backend Guide:** `backend/DEPLOYMENT.md`

#### Setup Frontend Application

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file:
# VITE_API_URL=https://nsac-mu.vercel.app
```

#### 6️⃣ Setup Edge Servers (For Decentralized Deployment)

`Will be added soon.`

### Running the Application

#### Start All Services (Recommended Order)

**Database**

```bash
cd database
docker-compose up -d postgres
```

**Data Processor**

```bash
cd data-processing

# Run the docker image
docker-compose up -d data-processor
```

**Backend API**

```bash
cd backend
npm start
# Or for development with auto-reload
npm run dev
```

**Frontend**

```bash
cd frontend
npm run dev
```

### 🔧 Development Commands

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend

```bash
npm start            # Start server
npm run dev          # Start with auto-reload
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:generate  # Generate Prisma Client
```

#### Data Processing

```bash
python main_pipeline.py              # Run all pipelines once
python air-quality/main.py           # Air quality only
python wildfire/firms_client.py      # Wildfire detection
python heatwave/heatwave_calculator.py  # Heatwave prediction
```

### 🐳 Docker Deployment

#### Build Backend Container

```bash
cd backend
docker build -t airowatch-backend .
docker-compose up -d
```

### ☁️ Production Deployment

`This is still a prototype. Production deployment guideline will be added soon`

## 🎯 NASA Space Apps Challenge 2025

### Challenge Themes Addressed

This project comprehensively addresses multiple NASA Space Apps Challenge themes:

#### 🌍 **Earth Observation & Monitoring**

- Real-time utilization of NASA's TEMPO, MODIS, VIIRS, and FIRMS satellites
- Multi-satellite data fusion for comprehensive environmental monitoring
- Processing terabytes of satellite data through automated pipelines
- High-resolution atmospheric and land surface temperature monitoring

#### 🌡️ **Climate Change & Environmental Impact**

- Tracking atmospheric composition changes and pollutant trends
- Long-term climate pattern analysis through historical data
- Heatwave detection and prediction using NASA MODIS data
- Environmental impact assessment and reporting tools

#### 🚨 **Disaster Management & Early Warning**

- Wildfire detection and tracking with NASA FIRMS integration
- Heatwave prediction and advisory system
- Air quality emergency forecasting with 24-hour predictions
- Mass alert system for community protection and emergency response

#### 📊 **Data Visualization & Communication**

- Interactive dashboards for complex environmental data
- Real-time charts, maps, and statistical visualizations
- User-friendly interfaces for non-technical audiences
- Educational resources and learning materials

#### 👥 **Community Impact & Public Health**

- Tools for protecting public health and safety
- NGO coordination for emergency response
- Personal safety tracking and health profile management
- Educational content and emergency preparedness training

### NASA Data Sources

- **NASA TEMPO** - Tropospheric Emissions Monitoring of Pollution satellite
- **NASA MODIS** - Moderate Resolution Imaging Spectroradiometer
- **NASA VIIRS** - Visible Infrared Imaging Radiometer Suite
- **NASA FIRMS** - Fire Information for Resource Management System
- **NASA GEOS-CF** - Goddard Earth Observing System Composition Forecast

### Innovation & Impact

🌟 **Key Innovations:**

- **Decentralized Edge Server Architecture**: First-of-its-kind distributed system with independent servers at telco towers, radio stations, and TV stations
- **Personalized AI-Based Messaging**: AI generates custom alerts for each individual based on health profile, location, and current conditions
- **Complete Independence**: Each edge server operates autonomously with own database, data processing, and AI engine
- **Multi-Channel Alert Delivery**: SMS, voice calls, radio broadcasts, TV alerts, and mobile push notifications
- **Zero Single Point of Failure**: System continues operating even if central cloud or individual servers fail
- **Ultra-Low Latency**: Alerts generated and delivered locally in < 1 second
- AI-powered chatbot with real-time environmental context
- NGO-user coordination platform for emergency response
- Emergency simulation training for disaster preparedness
- Automated hourly data collection from multiple NASA satellites

📈 **Measurable Impact:**

- **Protects millions through edge computing**: Each telco tower covers 50km radius with personalized alerts
- **Reaches underserved areas**: Radio and TV broadcasts reach communities without smartphones
- **Resilient infrastructure**: No central point of failure, continues during internet outages
- **Personalized at scale**: AI generates thousands of custom messages simultaneously
- Enables NGOs to coordinate effective emergency responses
- Educates public about environmental health risks
- Provides actionable insights for policy makers
- Reduces health impacts through preventive alerts

## 🔮 Future Enhancements

### Planned Features

- **Mobile Application** - Native iOS/Android apps with offline capabilities
- **Advanced AI Models** - Deep learning for enhanced prediction accuracy
- **Social Features** - Community reporting and collaborative monitoring
- **Satellite Imagery** - Direct satellite image visualization and analysis
- **Historical Analysis** - Long-term trend analysis and climate pattern recognition
- **API for Developers** - Public API for third-party integrations
- **Multi-Language Support** - Internationalization for global reach
- **SMS Alerts** - Text message notifications for areas without internet
- **Voice Alerts** - Audio notifications for accessibility
- **AR Visualization** - Augmented reality for environmental data visualization

### Scalability Goals

- Expand geographic coverage to global monitoring
- Integrate additional NASA datasets (AIRS, OMI, OCO-2)
- Real-time satellite image processing and analysis
- Machine learning model training on historical patterns
- Predictive modeling for long-term environmental forecasting
- Integration with local weather stations and ground sensors

## 🤝 Contributing

We welcome contributions from the community! Please feel free to:

- Report bugs and issues
- Suggest new features and improvements
- Submit pull requests
- Share feedback and ideas

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

### Project Documentation

- [README.md](README.md) - Main project overview (this file)
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Detailed architecture and status

### Backend Documentation

- [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) - AWS deployment guide
- [backend/QUICK-DEPLOY.md](backend/QUICK-DEPLOY.md) - Quick deployment instructions

### Database Documentation

- [database/QUICKSTART.md](database/QUICKSTART.md) - 5-minute database setup
- [database/README.md](database/README.md) - Complete database guide
- [database/WINDOWS_SETUP.md](database/WINDOWS_SETUP.md) - Windows-specific instructions

### Data Pipeline Documentation

- [data-processing/README.md](data-processing/README.md) - Pipeline overview
- [data-processing/SYSTEM_SUMMARY.md](data-processing/SYSTEM_SUMMARY.md) - System architecture
- [data-processing/air-quality/README.md](data-processing/air-quality/README.md) - Air quality pipeline
- [data-processing/wildfire/README.md](data-processing/wildfire/README.md) - Wildfire pipeline
- [data-processing/heatwave/README.md](data-processing/heatwave/README.md) - Heatwave pipeline

## 🐛 Known Issues & Limitations

### Current Limitations

- Geographic coverage currently focused on North America (TEMPO satellite coverage area)
- TEMPO Realtime data not directly available. Using other NASA source or Forecasts as place holder.
- Publicly available NASA Data Files are huge and hard to process.
- Edge servers not ready to be integrated directly

### Planned Fixes

- Get data from more source
- Integrate TEMPO Realtime to the whole system when available.
- Upgrade the data-processor to make it more effeicient.
- Colaborate with Telco, Radio and TV stations to develop the edge servers more and make it easy to integrate directly.

## 📄 License

This project is developed for the **NASA Space Apps Challenge 2025**.

**Open Source License**: MIT License (see LICENSE file)

**NASA Data Usage**: All NASA data is publicly available and used in accordance with NASA's Open Data Policy. No proprietary data or restricted datasets are used.

## 🙏 Acknowledgments

### Organizations

- **NASA** - For providing free access to Earth observation data and APIs
- **Space Apps Challenge** - For the opportunity to create innovative solutions
- **GROQ AI** - For providing AI API access for intelligent features

### Open Source Projects

- **React Team** - For the amazing React framework
- **Prisma** - For the excellent ORM and database tools
- **Leaflet** - For interactive mapping capabilities
- **Recharts** - For beautiful data visualizations
- **All Contributors** - To the open-source libraries used in this project

### Inspiration

- **Environmental Scientists** worldwide who inspire us to protect our planet
- **First Responders & NGOs** who work tirelessly to save lives
- **Communities** affected by air quality emergencies and natural disasters

### Repository

**Project Repository:** [github.com/Muntahi-Safwan/NSAC](https://github.com/Muntahi-Safwan/NSAC)
**Issues & Bug Reports:** [GitHub Issues](https://github.com/Muntahi-Safwan/NSAC/issues)
**Feature Requests:** [GitHub Discussions](https://github.com/Muntahi-Safwan/NSAC/discussions)

### Challenge Information

**Challenge:** From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies
**Year:** 2025

### Contributing

We welcome contributions! A brif guideline will be provided soon.

## 🌟 Support the Project

If you find this project helpful:

- ⭐ **Star** this repository on GitHub
- 🐛 **Report bugs** and suggest features via Issues
- 🤝 **Contribute** code, documentation, or ideas
- 📢 **Share** with others who might benefit from AiroWatch
- 💬 **Provide feedback** on your experience

## 🔗 Useful Links

### NASA Resources

- [NASA API Portal](https://api.nasa.gov/)
- [NASA Earthdata](https://www.earthdata.nasa.gov/)
- [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)
- [NASA TEMPO Mission](https://tempo.si.edu/)
- [GEOS-CF Documentation](https://gmao.gsfc.nasa.gov/GEOS_systems/geos-cf.php)

### Technologies

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Learning Resources

- [Air Quality Index (AQI) Basics](https://www.airnow.gov/aqi/aqi-basics/)
- [Understanding Wildfires](https://www.nasa.gov/mission_pages/fires/main/index.html)
- [Climate Change Resources](https://climate.nasa.gov/)

---

<div align="center">

## 🌍 **AiroWatch** 🛰️

**Protecting Communities Through Intelligent Environmental Monitoring**

_Powered by NASA Satellites • Enhanced by AI • Built for Humanity_

---

**🚀 Built with ❤️ for NASA Space Apps Challenge 2025**

[![NASA](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue?style=for-the-badge&logo=nasa)](https://spaceapps.nasa.gov)
[![GitHub](https://img.shields.io/badge/GitHub-Muntahi--Safwan%2FNSAC-black?style=for-the-badge&logo=github)](https://github.com/Muntahi-Safwan/NSAC)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**⭐ Star this repository if you find it helpful! ⭐**

</div>
