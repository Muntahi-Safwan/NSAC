# 🌍 Our Earth - NASA Space Apps Challenge 2025

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue?style=for-the-badge&logo=nasa)](https://spaceapps.nasa.gov)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.13-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

> **Discover the power of real-time Earth observation data. Monitor air pollution, track disaster hazards, and predict cleaner, safer skies with cutting-edge cloud computing technology.**

## 🚀 Overview

**Our Earth** is an advanced environmental monitoring platform developed for the NASA Space Apps Challenge 2025. This comprehensive solution leverages NASA's extensive satellite network and cutting-edge cloud computing to provide real-time air quality monitoring, disaster hazard prediction, and environmental insights on a global scale.

### 🎯 Mission Statement

Empowering communities worldwide with actionable environmental intelligence through real-time satellite data analysis, helping predict and prevent air quality emergencies and natural disasters before they impact lives.

## ✨ Key Features

### 🛰️ **Real-Time Air Quality Monitoring**
- Advanced satellite data processing to monitor PM2.5, PM10, NO2, and other critical air pollutants
- Global coverage with high-resolution atmospheric data
- Continuous monitoring across urban areas, industrial zones, and remote regions

### ⚠️ **Disaster Hazard Prediction**
- Machine learning algorithms analyze atmospheric conditions
- Predict wildfires, dust storms, and air quality emergencies
- Early warning systems for natural disasters and environmental hazards

### 🌐 **Satellite Earth Observation**
- Leverage NASA's extensive satellite network (MODIS, VIIRS, Sentinel)
- Comprehensive environmental monitoring capabilities
- High-resolution Earth observation data processing

### ☁️ **Cloud Computing Analytics**
- High-performance cloud infrastructure
- Process terabytes of Earth observation data
- Deliver actionable environmental insights in real-time

### 🔔 **Instant Alert System**
- Immediate notifications for air quality deterioration
- Wildfire risk alerts and environmental emergency warnings
- Community protection through rapid response systems

### 🗺️ **Global Coverage Network**
- Worldwide monitoring system
- Coverage of urban areas, industrial zones, and remote regions
- Comprehensive air quality assessment platform

## 🏗️ Technology Architecture

### **Data Collection Pipeline**
1. **Satellite Data Ingestion** - NASA's MODIS, VIIRS, and Sentinel satellites
2. **Cloud Processing** - Advanced cloud computing infrastructure
3. **AI Analysis** - Machine learning models for pattern recognition
4. **Real-time Alerts** - Instant notification system

### **Tech Stack**

#### Frontend
- **React 19.1.1** - Modern UI framework with React Compiler
- **TypeScript 5.8.3** - Type-safe development
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Vite 7.1.7** - Fast build tool and development server
- **React Router 7.9.3** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Radix UI** - Accessible component primitives

#### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web application framework
- **NASA Earth Data APIs** - Satellite data integration
- **Machine Learning Pipeline** - AI-powered analysis

#### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Babel React Compiler** - Optimized React compilation

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
├── backend/
│   ├── package.json
│   └── src/
│       └── server.js
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── public/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── components/
        │   ├── Footer.tsx
        │   ├── Navbar.tsx
        │   ├── sections/
        │   │   ├── FeaturesSection.tsx
        │   │   ├── StatsSection.tsx
        │   │   └── TechnologySection.tsx
        │   └── ui/
        │       └── button.tsx
        ├── layouts/
        │   └── RootLayout.tsx
        ├── pages/
        │   └── HomePage/
        │       └── Home.tsx
        └── routes/
            └── Routes.tsx
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Muntahi-Safwan/NSAC.git
   cd NSAC
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

### Development

1. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

2. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The API will be available at `http://localhost:3000`

### Build for Production

```bash
cd frontend
npm run build
```

## 🌟 Features Showcase

### **Air Quality Dashboard**
- Real-time pollutant level monitoring
- Interactive maps with color-coded air quality indices
- Historical data trends and analysis
- Location-based air quality reports

### **Disaster Prediction System**
- Wildfire risk assessment using satellite thermal data
- Dust storm tracking and prediction models
- Air quality emergency forecasting
- Community alert and notification system

### **Environmental Analytics**
- Comprehensive atmospheric condition analysis
- Pollution source identification and tracking
- Climate pattern recognition and reporting
- Environmental impact assessment tools

## 🎯 NASA Space Apps Challenge Integration

This project addresses multiple NASA Space Apps Challenge themes:
- **Earth Observation** - Utilizing NASA's satellite data for environmental monitoring
- **Climate Change** - Tracking and predicting atmospheric changes
- **Disaster Management** - Early warning systems for environmental hazards
- **Data Visualization** - Interactive dashboards for complex environmental data
- **Community Impact** - Tools for protecting public health and safety

## 🔮 Future Enhancements

- **Mobile Application** - Native iOS/Android apps for on-the-go monitoring
- **Advanced AI Models** - Enhanced prediction accuracy using deep learning
- **Social Features** - Community reporting and collaborative monitoring
- **API Integration** - Third-party weather and environmental data sources
- **Offline Capabilities** - Critical alerts and data caching for remote areas

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

## 📄 License

This project is developed for the NASA Space Apps Challenge 2025. Please refer to the challenge guidelines for usage and licensing information.

## 🙏 Acknowledgments

- **NASA** for providing access to Earth observation data and APIs
- **Space Apps Challenge** for the opportunity to create innovative solutions
- **Open Source Community** for the amazing tools and libraries used in this project
- **Environmental Scientists** who inspire us to protect our planet

## 📞 Contact

**Team:** Muntahi Safwan  
**Challenge:** NASA Space Apps Challenge 2025  
**Repository:** [github.com/Muntahi-Safwan/NSAC](https://github.com/Muntahi-Safwan/NSAC)

---

<div align="center">

**🌍 Protecting Our Planet Through Technology 🛰️**

*Built with ❤️ for NASA Space Apps Challenge 2025*

</div>