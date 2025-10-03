# 🌍 AiroWatch - NASA Space Apps Challenge 2025

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue?style=for-the-badge&logo=nasa)](https://spaceapps.nasa.gov)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)

> **Your comprehensive environmental guardian powered by NASA satellites. Real-time air quality monitoring, wildfire tracking, heatwave detection, and AI-powered insights to protect communities worldwide.**

## 🔗 Live Demo

**🚀 [View Live Application](#)** *(Deployment in progress - Coming soon!)*

---

## 🚀 Overview

**AiroWatch** is an award-winning environmental monitoring and disaster response platform developed for the NASA Space Apps Challenge 2025. This comprehensive solution combines NASA's satellite network, advanced AI, and cloud computing to deliver real-time air quality monitoring, wildfire tracking, heatwave detection, and emergency response coordination on a global scale.

### 🎯 Mission Statement

Protecting communities worldwide through intelligent environmental monitoring. We leverage NASA satellite data, artificial intelligence, and collaborative emergency response systems to predict and prevent environmental disasters before they threaten lives.

## ✨ Core Features

### 🌬️ **Comprehensive Air Quality Monitoring**
- **Multi-Pollutant Tracking**: Real-time monitoring of PM2.5, PM10, NO₂, O₃, SO₂, and CO
- **NASA TEMPO Integration**: Hourly satellite data collection from NASA's TEMPO satellite
- **24-Hour Forecasting**: AI-powered air quality predictions with machine learning models
- **AQI Calculation**: Automated Air Quality Index with color-coded severity levels
- **Interactive Maps**: Real-time visualization with pollutant layers and regional statistics
- **Historical Trends**: 7-day trend analysis with detailed pollutant breakdowns
- **Regional Coverage**: Monitors 19+ regions with customizable geographic filters

### 🔥 **Real-Time Wildfire Detection & Tracking**
- **NASA FIRMS Integration**: Live wildfire data from Fire Information for Resource Management System
- **Dual Satellite System**: VIIRS and MODIS satellites for comprehensive coverage
- **Fire Radiative Power (FRP)**: Measures fire intensity and severity in real-time
- **48-Hour Active Fires**: Displays fires detected in the last 2 days with high/medium/low confidence
- **Interactive Fire Map**: Color-coded severity indicators (Critical/High/Moderate/Low)
- **Automated Alerts**: Generates notifications for new fire detections
- **Statistics Dashboard**: Total fires, acres burned, containment rates, and affected areas
- **Hourly Updates**: Automated data collection every hour with near real-time processing

### 🌡️ **Advanced Heatwave Monitoring & Prediction**
- **NASA MODIS Data**: Land Surface Temperature (LST) monitoring from satellite imagery
- **5-Day Forecast**: Temperature predictions with humidity integration
- **Heat Advisory System**: Automated risk classification (Critical/High/Medium/Low)
- **Heatwave Detection**: Sophisticated algorithms with location-specific temperature baselines
- **Interactive Heatwave Map**: Visual representation with severity indicators and active alerts
- **Meteorological Processing**: 120 hours of hourly data for accurate forecasting
- **Geographic Filtering**: Regional targeting for precise monitoring

### 🤖 **AI-Powered Intelligence Suite**
- **AI Chatbot Assistant**: Context-aware chatbot powered by GROQ AI
  - Real-time air quality context integration
  - Natural language processing for environmental queries
  - Health risk assessments and safety recommendations
  - Activity suggestions based on current conditions
  - Message history and markdown support
- **AI Location Insights**: Personalized analysis with location-specific recommendations
- **AI Tip of the Day**: Daily health tips adjusted to current air quality
- **AI Quiz System**: Adaptive difficulty quizzes with instant feedback and progress tracking
- **Predictive Analytics**: Machine learning models for forecasting accuracy

### 🚨 **Emergency Response & NGO Coordination**
- **NGO Dashboard**: Comprehensive platform for non-governmental organizations
  - Regional user management and safety statistics
  - Mass alert broadcasting with severity levels
  - User filtering by safety status, health conditions, location
  - Track sent notifications and recipient counts
- **Safety Status System**: Users can mark themselves Safe/Need Help during emergencies
- **Mass Alert System**: Broadcast critical alerts to all users in specific regions
- **Disaster Notifications**: Special emergency alerts with priority levels
- **Real-Time Coordination**: Connect NGOs with at-risk community members

### 👤 **User-Centric Features**
- **Personal Safety Dashboard**: Track your safety status and location during emergencies
- **Health Profile Management**: Store diseases, allergies, age, emergency contacts
- **Location Tracking**: GPS-based location sharing with reverse geocoding
- **Push Notifications**: Browser-based alerts for air quality and disasters
- **Notification Center**: View all alerts with severity indicators and history
- **Multi-Contact Support**: Multiple phone numbers with primary contact designation
- **Profile Customization**: Update personal information, phone numbers, social media

### 📊 **Advanced Analytics & Visualizations**
- **Multi-Tab Analytics Dashboard**: Overview, Air Quality, Heatwave, Wildfire sections
- **Real-Time Statistics**: Average AQI, active heatwaves, active wildfires, monitored regions
- **Interactive Charts**: 7-day trends, pollutant distribution, wildfire activity, time series
- **Regional Breakdown**: Heatwave analysis with temperature, risk, affected population
- **Performance Metrics**: Fires detected, containment rates, pollution levels
- **Data Export**: Download reports and historical data

### 📚 **Educational & Training Resources**
- **Learning Hub**: Comprehensive articles, guides, and blog posts
- **Interactive Quizzes**: AI-generated questions across multiple difficulty levels
- **Hazard Simulation**: Practice emergency response with realistic scenarios
- **Category Filtering**: Air Quality, Health, Safety, Technology topics
- **Search Functionality**: Find relevant educational content quickly
- **Progress Tracking**: Monitor quiz scores and learning achievements

### 🔔 **Intelligent Alert & Notification System**
- **Multi-Level Severity**: Critical, Danger, Warning, Info classifications
- **Targeted Alerts**: Regional broadcasting to affected communities
- **NGO Alerts**: Receive notifications from local verified organizations
- **Browser Push Notifications**: Real-time alerts even when app is closed
- **Alert History**: Access past notifications and emergency messages
- **Customizable Preferences**: Control notification types and frequencies

## 🏗️ Technology Architecture

### **System Architecture Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                    NASA Satellite Network                        │
│         TEMPO • MODIS • VIIRS • FIRMS • GEOS-CF                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Python Data Pipelines        │
         │   • Air Quality Pipeline       │
         │   • Wildfire Pipeline          │
         │   • Heatwave Pipeline          │
         │   • Hourly Cron Jobs           │
         └──────────┬────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │   PostgreSQL Database        │
         │   • Air Quality Forecasts    │
         │   • Fire Detections          │
         │   • Temperature Data         │
         │   • User & NGO Data          │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │   Node.js Backend API        │
         │   • RESTful Endpoints        │
         │   • JWT Authentication       │
         │   • AI Integration (GROQ)    │
         │   • Real-time Processing     │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │   React Frontend             │
         │   • Interactive Maps         │
         │   • Analytics Dashboard      │
         │   • User & NGO Portals       │
         │   • Real-time Updates        │
         └─────────────────────────────┘
```

### **Tech Stack**

#### 🎨 Frontend Technologies
- **React 19.1.1** - Modern UI framework with React Compiler for optimal performance
- **TypeScript 5.8.3** - Type-safe development with strict typing
- **Tailwind CSS 4.1.13** - Utility-first CSS framework for responsive design
- **Vite 7.1.7** - Lightning-fast build tool and development server
- **React Router 7.9.3** - Client-side routing with protected routes
- **Leaflet** - Interactive map library for geospatial visualizations
- **Recharts 3.2.1** - Composable charting library for data visualization
- **Axios 1.12.2** - Promise-based HTTP client for API calls
- **Lucide React** - Beautiful, consistent icon library
- **Radix UI** - Accessible, unstyled component primitives
- **React Markdown** - Markdown rendering with GitHub-flavored markdown support

#### ⚙️ Backend Technologies
- **Node.js 20+** - JavaScript runtime environment
- **Express.js 5.1.0** - Fast, minimalist web framework
- **Prisma 6.16.2** - Next-generation ORM for type-safe database access
- **PostgreSQL** - Robust relational database with PostGIS for geospatial data
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication tokens
- **bcryptjs 3.0.2** - Password hashing and salting
- **GROQ AI API** - Advanced AI integration for chatbot and insights
- **Express Validator 7.2.1** - Middleware for input validation

#### 🐍 Data Processing Pipeline
- **Python 3.8+** - Data processing and analysis
- **NetCDF4** - Reading NASA satellite data files
- **NumPy** - Numerical computing for large datasets
- **Pandas** - Data manipulation and analysis
- **Prisma Python** - Type-safe database ORM
- **Requests** - HTTP library for API calls to NASA services
- **Cron Scheduler** - Automated hourly data collection

#### 🛢️ Database & Infrastructure
- **PostgreSQL 16** - Primary database with advanced features
- **PostGIS** - Geospatial extension for location-based queries
- **TimescaleDB** - Time-series optimization for temporal data
- **Docker & Docker Compose** - Containerization for consistent environments
- **Prisma Schema** - Database modeling with migrations

#### ☁️ Deployment & DevOps
- **Docker** - Container platform for consistent deployment
- **AWS ECS/Fargate** - Serverless container orchestration
- **AWS ECR** - Container registry for Docker images
- **AWS Secrets Manager** - Secure credential management
- **Application Load Balancer** - Traffic distribution and health checks
- **CloudWatch** - Logging, monitoring, and metrics

#### 🛠️ Development Tools
- **ESLint 9.36.0** - Code linting and quality enforcement
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Babel React Compiler** - Optimized React compilation
- **Git & GitHub** - Version control and collaboration
- **Prisma Studio** - Database GUI for development

## 🎨 Design System

The application features a stunning space-themed design with:
- **Gradient backgrounds** from deep space blues to cosmic purples
- **Interactive animations** including twinkling stars and floating planets
- **Glass morphism effects** with backdrop blur and transparency
- **3D Earth visualization** with atmospheric glow and orbital effects
- **Responsive design** optimized for all screen sizes

## 📁 Project Structure

```
NSAC/
├── README.md
├── PROJECT_OVERVIEW.md
├── .gitignore
│
├── backend/                        # Node.js/Express API Server
│   ├── package.json
│   ├── Dockerfile                  # Container configuration
│   ├── docker-compose.yml          # Local development setup
│   ├── DEPLOYMENT.md               # AWS deployment guide
│   ├── aws-task-definition.json    # ECS task configuration
│   ├── deploy-to-aws.sh            # Automated deployment script
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   └── src/
│       ├── server.js               # Main application entry
│       ├── routes/
│       │   ├── auth.routes.js      # User authentication
│       │   ├── airQuality.routes.js
│       │   ├── chatbot.routes.js   # AI chatbot endpoints
│       │   ├── quiz.routes.js      # Quiz system
│       │   ├── ngo.routes.js       # NGO management
│       │   ├── notification.routes.js
│       │   ├── user.routes.js
│       │   ├── search.routes.js
│       │   └── wildfire.routes.js
│       ├── controllers/            # Business logic
│       ├── middleware/             # Auth, validation, error handling
│       └── services/               # External API integrations
│
├── frontend/                       # React/TypeScript Application
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       │   ├── AIChatbot.tsx
│       │   ├── AILocationInsights.tsx
│       │   ├── AITipOfTheDay.tsx
│       │   ├── AirQualityMap.tsx
│       │   ├── AQISpeedometer.tsx
│       │   ├── LocationTracker.tsx
│       │   ├── NotificationBell.tsx
│       │   ├── NotificationSettings.tsx
│       │   ├── PollutantDetails.tsx
│       │   ├── TrendCharts.tsx
│       │   ├── NGO/
│       │   │   └── NGOProfileModal.tsx
│       │   ├── Quiz/
│       │   │   ├── QuizCard.tsx
│       │   │   ├── QuizQuestion.tsx
│       │   │   └── QuizResults.tsx
│       │   ├── Simulation/
│       │   │   ├── SimulationButton.tsx
│       │   │   ├── SimulationModal.tsx
│       │   │   └── SimulationToast.tsx
│       │   ├── sections/
│       │   │   ├── FeaturesSection.tsx
│       │   │   ├── StatsSection.tsx
│       │   │   └── TechnologySection.tsx
│       │   └── ui/                 # Reusable UI components
│       ├── contexts/               # React Context (Auth, NGO, Simulation)
│       ├── layouts/
│       │   └── RootLayout.tsx
│       ├── pages/
│       │   ├── HomePage/
│       │   ├── MapPage/
│       │   │   ├── MapPage.tsx
│       │   │   ├── HeatwaveMap.tsx
│       │   │   └── WildfireMap.tsx
│       │   ├── Analytics/
│       │   │   └── AnalyticsDashboard.tsx
│       │   ├── AuthPage/
│       │   ├── User/
│       │   │   ├── UserDashboard.tsx
│       │   │   └── UserProfile.tsx
│       │   ├── NGO/
│       │   │   ├── NGODashboard.tsx
│       │   │   ├── NGOLogin.tsx
│       │   │   └── NGORegister.tsx
│       │   ├── LearningPage/
│       │   ├── QuizPage/
│       │   ├── SearchPage/
│       │   ├── AboutPage/
│       │   └── ContactPage/
│       └── routes/
│           └── Routes.tsx
│
├── data-processing/                # Python Data Pipelines
│   ├── requirements.txt
│   ├── schema.prisma               # Database schema (Python)
│   ├── main_pipeline.py            # Main orchestrator
│   ├── smart_downloader.py         # NASA data downloader
│   ├── data_processor.py           # Data processing & conversions
│   ├── database.py                 # Database operations
│   ├── air-quality/                # Air quality pipeline
│   │   ├── main.py
│   │   ├── forecast.py
│   │   └── realtime/
│   │       └── tempo/
│   ├── wildfire/                   # Wildfire detection pipeline
│   │   ├── firms_client.py         # NASA FIRMS API client
│   │   └── fire_database.py
│   ├── heatwave/                   # Heatwave prediction pipeline
│   │   ├── heatwave_calculator.py
│   │   └── modis_processor.py
│   ├── scheduler/                  # Cron job management
│   │   ├── service_manager.sh
│   │   └── start_all_services.sh
│   ├── downloads/                  # Downloaded satellite data (gitignored)
│   ├── README.md
│   └── SYSTEM_SUMMARY.md
│
└── database/                       # PostgreSQL Docker Setup
    ├── docker-compose.yml
    ├── .env.template
    ├── init-scripts/               # Auto-run on first start
    ├── QUICKSTART.md               # 5-minute setup guide
    ├── README.md
    ├── SETUP_PROCESS.md
    └── WINDOWS_SETUP.md
```

## 🚀 Getting Started

### Prerequisites

#### Required Software
- **Docker Desktop** - For PostgreSQL database ([Download](https://www.docker.com/products/docker-desktop))
- **Python 3.8+** - For data processing pipelines ([Download](https://www.python.org/downloads/))
- **Node.js 20+** - For frontend and backend ([Download](https://nodejs.org/))
- **Git** - Version control system ([Download](https://git-scm.com/))

#### API Keys (Required)
- **NASA API Key** - Get from [NASA API Portal](https://api.nasa.gov/)
- **GROQ AI API Key** - Get from [GROQ Console](https://console.groq.com/)

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Muntahi-Safwan/NSAC.git
cd NSAC
```

#### 2️⃣ Setup Database with Docker
```bash
cd database

# Windows
copy .env.template .env

# Linux/Mac
cp .env.template .env

# Edit .env file with your database credentials
# Start PostgreSQL container
docker-compose up -d postgres
```

📚 **Detailed Guides:**
- Quick Setup: `database/QUICKSTART.md`
- Complete Guide: `database/README.md`
- Windows Users: `database/WINDOWS_SETUP.md`

#### 3️⃣ Setup Data Processing Pipeline
```bash
cd ../data-processing

# Install Python dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Push database schema
prisma db push

# Configure environment variables
# Create .env with your NASA API keys
```

📚 **Data Pipeline Docs:** `data-processing/README.md`

#### 4️⃣ Setup Backend API
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

#### 5️⃣ Setup Frontend Application
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file:
# VITE_API_URL=https://nsac-mu.vercel.app
```

### 🏃 Running the Application

#### Start All Services (Recommended Order)

**Terminal 1 - Database**
```bash
cd database
docker-compose up -d postgres
```

**Terminal 2 - Data Pipelines (Optional - for fresh data)**
```bash
cd data-processing

# Run all pipelines once
python main_pipeline.py

# Or start scheduled services
cd scheduler
./start_all_services.sh
```

**Terminal 3 - Backend API**
```bash
cd backend
npm start
# Or for development with auto-reload
npm run dev
```
🌐 API available at: `https://nsac-mu.vercel.app`

**Terminal 4 - Frontend**
```bash
cd frontend
npm run dev
```
🌐 Application available at: `http://localhost:5173`

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

#### Test Health Endpoints
```bash
curl https://nsac-mu.vercel.app/health
curl https://nsac-mu.vercel.app/ready
curl https://nsac-mu.vercel.app/live
```

### ☁️ Production Deployment

The project is deployment-ready for AWS with complete configuration:

```bash
cd backend

# Configure AWS credentials
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=your-account-id

# Run automated deployment
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

📚 **Full Deployment Guide:** `backend/DEPLOYMENT.md`

**Deployment Options:**
- AWS ECS/Fargate (Recommended)
- AWS App Runner
- Docker on any cloud provider
- Traditional VPS deployment

## 🌟 Features Showcase

### 🗺️ **Interactive Air Quality Dashboard**
- **Real-Time Monitoring**: Live pollutant levels (PM2.5, PM10, NO₂, O₃, SO₂, CO) updated hourly
- **AQI Speedometer**: Visual gauge showing current air quality with color-coded severity
- **Interactive Maps**: Leaflet-based maps with regional zones, pollutant layers, and statistics
- **Pollutant Details**: Comprehensive breakdown of each pollutant with safety thresholds
- **7-Day Trends**: Historical charts showing air quality patterns and forecasts
- **Location Search**: Find and monitor specific cities and regions
- **Live Updates**: Real-time data refresh with monitoring indicators

### 🔥 **Wildfire Tracking System**
- **Real-Time Detection**: NASA FIRMS data showing active fires from VIIRS and MODIS satellites
- **Fire Intensity Metrics**: Fire Radiative Power (FRP) measurements for severity assessment
- **Interactive Fire Map**: Color-coded markers (Red/Orange/Yellow) based on fire severity
- **48-Hour Window**: Displays fires detected in the last 2 days with confidence levels
- **Fire Statistics**: Total fires, high-confidence detections, critical/moderate counts
- **Auto-Refresh**: Manual and scheduled data updates every hour
- **Alert Generation**: Automatic notifications for new fire detections

### 🌡️ **Heatwave Prediction Dashboard**
- **5-Day Forecast**: Temperature predictions with NASA MODIS Land Surface Temperature data
- **Risk Classification**: Critical, High, Medium, Low heat advisory levels
- **Interactive Heatwave Map**: Visual representation of heat zones with severity indicators
- **Active Alerts Panel**: Real-time list of heatwave warnings by region
- **Humidity Integration**: Combined temperature and humidity for accurate risk assessment
- **Current vs Forecast**: Toggle between present conditions and future predictions
- **Location-Specific**: Regional temperature baselines and threshold detection

### 🤖 **AI-Powered Assistant Suite**
- **Context-Aware Chatbot**: GROQ AI-powered assistant with real-time air quality context
- **Natural Conversations**: Ask questions about air quality, health risks, and safety
- **Quick Actions**: One-click access to tips, trends, and activity recommendations
- **Location Insights**: Personalized analysis based on your current location
- **Daily Tips**: Rotating health and safety tips adjusted to current conditions
- **Smart Quizzes**: AI-generated questions with adaptive difficulty and instant feedback
- **Markdown Support**: Rich text responses with proper formatting

### 🚨 **Emergency Response Portal (NGO Dashboard)**
- **Regional User Management**: View all users in your service area with safety statistics
- **Mass Alert System**: Send critical alerts to all users in specific regions
- **Safety Tracking**: Monitor users marked as "Safe" vs "Need Help"
- **User Filtering**: Search by name, email, phone, safety status, health conditions
- **Alert History**: Track all sent notifications with recipient counts
- **Severity Levels**: Critical, Warning, Info classifications for targeted messaging
- **Verification System**: Verified NGO badges for trusted organizations

### 👤 **Personal Safety Dashboard**
- **Safety Status**: Mark yourself Safe/Need Help during emergencies with one click
- **GPS Location Sharing**: Automatic location tracking with reverse geocoding
- **Health Profile**: Store diseases, allergies, age, emergency contacts
- **Notification Center**: Receive and view all alerts from NGOs and system
- **Multi-Contact**: Add multiple phone numbers with primary designation
- **Profile Management**: Update personal information and social media links
- **Emergency Simulation**: Practice emergency procedures with realistic scenarios

### 📊 **Advanced Analytics Dashboard**
- **Multi-Tab Interface**: Separate views for Overview, Air Quality, Heatwave, Wildfire
- **Real-Time Statistics**:
  - Average AQI across all monitored regions
  - Active heatwaves count
  - Active wildfires count
  - Total monitored regions
- **Interactive Charts**:
  - 7-day air quality trend (Area Chart)
  - Pollutant distribution (Pie Chart)
  - 6-month wildfire activity (Bar Chart)
  - Multi-pollutant time series (Line Chart)
- **Regional Analysis**: Heatwave breakdown with temperature, risk, affected population
- **Performance Metrics**: Fires detected, acres burned, containment rates

### 📚 **Learning & Education Hub**
- **Article Library**: Comprehensive guides on air quality, health, and safety
- **Blog Posts**: Regular updates on environmental topics and research
- **Category System**: Filter by Air Quality, Health, Safety, Technology
- **Search Function**: Keyword search across all educational content
- **Priority Indicators**: Critical Safety Information highlighted
- **Reading Time**: Estimated time for each article
- **Tags & Organization**: Topic-based content categorization
- **Featured Content**: Highlighted important articles and guides

### 🎯 **Interactive Quiz System**
- **AI-Generated Questions**: Dynamic quiz creation using GROQ AI
- **Difficulty Levels**: Beginner, Intermediate, Advanced categories
- **Multiple Topics**: Air Quality, Health, Environment, Technology
- **Progress Tracking**: Visual progress bar and performance metrics
- **Instant Feedback**: Check answers with detailed AI explanations
- **Results Screen**: Score percentage, question breakdown, performance analysis
- **Quiz History**: Track past attempts and improvement over time
- **Retry System**: Retake quizzes to improve scores

### 🎭 **Emergency Simulation Training**
- **Realistic Scenarios**: Practice response to air quality emergencies
- **AI Risk Assessment**: Personalized health risk based on your profile
- **Sequential Alerts**: Progressive notification system during simulation
- **Visual Indicators**: Red alert banners and toast notifications
- **Safety Training**: Learn proper emergency protocols
- **Simulation Controls**: Start, pause, stop emergency scenarios
- **Educational Tool**: Prepare for real emergencies safely

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
- First-of-its-kind integration of air quality, wildfire, and heatwave monitoring
- AI-powered chatbot with real-time environmental context
- NGO-user coordination platform for emergency response
- Emergency simulation training for disaster preparedness
- Automated hourly data collection from multiple NASA satellites

📈 **Measurable Impact:**
- Protects communities through early warning systems
- Enables NGOs to coordinate effective emergency responses
- Educates public about environmental health risks
- Provides actionable insights for policy makers
- Reduces health impacts through preventive alerts

## 🔮 Future Enhancements

### Planned Features
- [ ] **Mobile Application** - Native iOS/Android apps with offline capabilities
- [ ] **Advanced AI Models** - Deep learning for enhanced prediction accuracy
- [ ] **Social Features** - Community reporting and collaborative monitoring
- [ ] **Satellite Imagery** - Direct satellite image visualization and analysis
- [ ] **Historical Analysis** - Long-term trend analysis and climate pattern recognition
- [ ] **API for Developers** - Public API for third-party integrations
- [ ] **Multi-Language Support** - Internationalization for global reach
- [ ] **SMS Alerts** - Text message notifications for areas without internet
- [ ] **Voice Alerts** - Audio notifications for accessibility
- [ ] **AR Visualization** - Augmented reality for environmental data visualization

### Scalability Goals
- [ ] Expand geographic coverage to global monitoring
- [ ] Integrate additional NASA datasets (AIRS, OMI, OCO-2)
- [ ] Real-time satellite image processing and analysis
- [ ] Machine learning model training on historical patterns
- [ ] Predictive modeling for long-term environmental forecasting
- [ ] Integration with local weather stations and ground sensors

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

## 📊 Project Statistics

### Code Metrics
- **Frontend**: 20+ pages, 35+ components
- **Backend**: 50+ REST API endpoints
- **Data Pipelines**: 3 major pipelines (Air Quality, Wildfire, Heatwave)
- **Database Models**: 10+ Prisma models
- **Total Files**: 200+ source files

### Data & Coverage
- **Pollutants Tracked**: 6 types (PM2.5, PM10, NO₂, O₃, SO₂, CO)
- **Satellites Used**: 5 NASA satellites (TEMPO, MODIS, VIIRS, FIRMS, GEOS-CF)
- **Update Frequency**: Hourly automated data collection
- **Geographic Coverage**: North America focused, expandable globally
- **Monitoring Regions**: 19+ regions with real-time tracking

### Technology Stack
- **Languages**: TypeScript, JavaScript, Python, SQL
- **Frameworks**: React, Node.js/Express, Prisma
- **Databases**: PostgreSQL with PostGIS & TimescaleDB
- **Cloud**: Docker, AWS ECS/Fargate ready
- **AI**: GROQ AI integration for chatbot and insights

## 🔒 Security & Privacy

### Data Protection
- **Password Security**: Bcrypt hashing with salt rounds
- **Authentication**: JWT tokens with expiration
- **Environment Variables**: Sensitive data in .env files (not committed)
- **Input Validation**: Server-side validation with Express Validator
- **CORS Protection**: Configured cross-origin policies
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

### User Privacy
- **Optional Data**: Users control what information they share
- **Location Privacy**: GPS data only shared during emergencies if user opts in
- **Data Encryption**: Passwords and sensitive data encrypted at rest
- **Secure Communication**: HTTPS for production deployment
- **Access Control**: Role-based access (User, NGO, Admin)

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
- Data latency of 1-3 hours depending on satellite pass times
- Requires internet connection for real-time updates
- Push notifications require browser permission

### Planned Fixes
- Expanding geographic coverage to global monitoring
- Reducing data latency through additional data sources
- Adding offline mode for critical alerts
- SMS fallback for push notifications

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

## 📞 Contact & Support

### Project Team
**Developer:** Muntahi Safwan
**GitHub:** [@Muntahi-Safwan](https://github.com/Muntahi-Safwan)
**Email:** airowatch@gmail.com

### Repository
**Project Repository:** [github.com/Muntahi-Safwan/NSAC](https://github.com/Muntahi-Safwan/NSAC)
**Issues & Bug Reports:** [GitHub Issues](https://github.com/Muntahi-Safwan/NSAC/issues)
**Feature Requests:** [GitHub Discussions](https://github.com/Muntahi-Safwan/NSAC/discussions)

### Challenge Information
**Challenge:** NASA Space Apps Challenge 2025
**Category:** Earth Observation & Environmental Monitoring
**Year:** 2025

### Contributing
We welcome contributions! See [CONTRIBUTING.md](#) for guidelines.

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

*Powered by NASA Satellites • Enhanced by AI • Built for Humanity*

---

**🚀 Built with ❤️ for NASA Space Apps Challenge 2025**

[![NASA](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue?style=for-the-badge&logo=nasa)](https://spaceapps.nasa.gov)
[![GitHub](https://img.shields.io/badge/GitHub-Muntahi--Safwan%2FNSAC-black?style=for-the-badge&logo=github)](https://github.com/Muntahi-Safwan/NSAC)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**⭐ Star this repository if you find it helpful! ⭐**

</div>