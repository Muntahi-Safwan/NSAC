// Mock data for North America location and air quality data
export const northAmericaLocation = {
  lat: 40.7128,
  lng: -74.0060,
  city: "New York",
  country: "United States",
  name: "New York, United States"
};

export interface PollutantData {
  name: string;
  value: number;
  unit: string;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  description: string;
}

export interface AQIData {
  value: number;
  level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  description: string;
  color: string;
  aqi: number;
}

export const mockAQIData: AQIData = {
  value: 165,
  level: 'unhealthy',
  description: 'Unhealthy for Sensitive Groups',
  color: '#ff6b35',
  aqi: 165
};

export interface EnhancedPollutantData extends PollutantData {
  limit: number;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  source?: string;
  healthEffect?: string;
}

export const mockPollutants: EnhancedPollutantData[] = [
  {
    name: 'PM2.5',
    value: 78.4,
    unit: 'µg/m³',
    limit: 35,
    level: 'unhealthy',
    description: 'Fine Particulate Matter - Deep Lung Penetration',
    trend: 'up',
    change: 12.5,
    source: 'Vehicle emissions, industrial processes, dust',
    healthEffect: 'Respiratory and cardiovascular problems'
  },
  {
    name: 'NO₂',
    value: 52.3,
    unit: 'µg/m³',
    limit: 80,
    level: 'moderate',
    description: 'Nitrogen Dioxide - Traffic & Industrial Pollution',
    trend: 'up',
    change: 8.7,
    source: 'Vehicle exhaust, power plants, industrial facilities',
    healthEffect: 'Respiratory inflammation, increased asthma risk'
  },
  {
    name: 'SO₂',
    value: 28.9,
    unit: 'µg/m³',
    limit: 80,
    level: 'good',
    description: 'Sulfur Dioxide - Industrial & Power Generation',
    trend: 'down',
    change: -5.2,
    source: 'Coal burning, oil refineries, industrial processes',
    healthEffect: 'Respiratory irritation, eye inflammation'
  },
  {
    name: 'CO',
    value: 3.2,
    unit: 'mg/m³',
    limit: 10,
    level: 'good',
    description: 'Carbon Monoxide - Incomplete Combustion',
    trend: 'stable',
    change: 0.8,
    source: 'Vehicle emissions, industrial processes, heating',
    healthEffect: 'Reduces oxygen transport in blood'
  },
  {
    name: 'O₃',
    value: 95.8,
    unit: 'µg/m³',
    limit: 120,
    level: 'moderate',
    description: 'Ozone - Photochemical Smog Formation',
    trend: 'up',
    change: 15.3,
    source: 'Secondary pollutant from NOx and VOCs',
    healthEffect: 'Respiratory inflammation, reduced lung function'
  },
  
];

// Mock trend data for charts
export const mockPastTrendData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  predicted: Math.floor(Math.random() * 50) + 120 + Math.sin(i * 0.3) * 20,
  actual: Math.floor(Math.random() * 40) + 130 + Math.sin(i * 0.3) * 25,
  time: `${i.toString().padStart(2, '0')}:00`
}));

export const mockFutureTrendData = Array.from({ length: 24 }, (_, i) => ({
  hour: i + 24,
  predicted: Math.floor(Math.random() * 45) + 115 + Math.sin((i + 24) * 0.3) * 22,
  time: `${i.toString().padStart(2, '0')}:00`
}));

// Enhanced map zones interface for better type safety
export interface MapZone {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city: string;
  level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  aqi: number;
  radius: number;
  population?: number;
  dominantPollutant?: string;
  lastUpdated?: string;
  trend?: 'up' | 'down' | 'stable';
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}

// Mock map zones data for North America regions with more comprehensive data
export const mockMapZones: MapZone[] = [
  // Good zones (green)
  {
    id: 'portland-01', lat: 45.5152, lng: -122.6784, name: "Portland Metro", city: "Portland",
    level: 'good', aqi: 42, radius: 50000, population: 2400000, dominantPollutant: 'PM2.5',
    lastUpdated: '2 min ago', trend: 'stable', pm25: 12, pm10: 25, no2: 15, so2: 5, co: 0.6, o3: 35
  },
  {
    id: 'seattle-01', lat: 47.6062, lng: -122.3321, name: "Seattle Area", city: "Seattle",
    level: 'good', aqi: 38, radius: 60000, population: 3900000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'down', pm25: 10, pm10: 22, no2: 12, so2: 4, co: 0.5, o3: 38
  },
  {
    id: 'minneapolis-01', lat: 44.9778, lng: -93.2650, name: "Minneapolis-St. Paul", city: "Minneapolis",
    level: 'good', aqi: 45, radius: 55000, population: 3600000, dominantPollutant: 'PM10',
    lastUpdated: '3 min ago', trend: 'stable', pm25: 14, pm10: 28, no2: 16, so2: 6, co: 0.7, o3: 32
  },
  {
    id: 'boston-01', lat: 42.3601, lng: -71.0589, name: "Greater Boston", city: "Boston",
    level: 'good', aqi: 48, radius: 50000, population: 4900000, dominantPollutant: 'NO2',
    lastUpdated: '1 min ago', trend: 'stable', pm25: 15, pm10: 30, no2: 18, so2: 7, co: 0.8, o3: 36
  },

  // Moderate zones (yellow)
  {
    id: 'chicago-01', lat: 41.8781, lng: -87.6298, name: "Chicago Metro", city: "Chicago",
    level: 'moderate', aqi: 72, radius: 70000, population: 9500000, dominantPollutant: 'O3',
    lastUpdated: '2 min ago', trend: 'up', pm25: 35, pm10: 55, no2: 32, so2: 18, co: 1.4, o3: 68
  },
  {
    id: 'philadelphia-01', lat: 39.9526, lng: -75.1652, name: "Philadelphia Metro", city: "Philadelphia",
    level: 'moderate', aqi: 68, radius: 55000, population: 6100000, dominantPollutant: 'PM2.5',
    lastUpdated: '4 min ago', trend: 'stable', pm25: 32, pm10: 52, no2: 28, so2: 15, co: 1.2, o3: 58
  },
  {
    id: 'denver-01', lat: 39.7392, lng: -104.9903, name: "Denver Metro", city: "Denver",
    level: 'moderate', aqi: 78, radius: 50000, population: 2900000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'down', pm25: 38, pm10: 58, no2: 30, so2: 16, co: 1.5, o3: 72
  },
  {
    id: 'atlanta-01', lat: 33.7490, lng: -84.3880, name: "Atlanta Metro", city: "Atlanta",
    level: 'moderate', aqi: 65, radius: 60000, population: 6000000, dominantPollutant: 'O3',
    lastUpdated: '3 min ago', trend: 'stable', pm25: 30, pm10: 48, no2: 26, so2: 12, co: 1.1, o3: 65
  },
  {
    id: 'phoenix-01', lat: 33.4484, lng: -112.0740, name: "Phoenix Metro", city: "Phoenix",
    level: 'moderate', aqi: 82, radius: 65000, population: 4900000, dominantPollutant: 'PM10',
    lastUpdated: '2 min ago', trend: 'up', pm25: 40, pm10: 62, no2: 28, so2: 14, co: 1.3, o3: 70
  },
  {
    id: 'dallas-01', lat: 32.7767, lng: -96.7970, name: "Dallas-Fort Worth", city: "Dallas",
    level: 'moderate', aqi: 75, radius: 65000, population: 7600000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'stable', pm25: 36, pm10: 56, no2: 32, so2: 16, co: 1.4, o3: 68
  },

  // Unhealthy zones (orange/red)
  {
    id: 'losangeles-01', lat: 34.0522, lng: -118.2437, name: "Los Angeles Basin", city: "Los Angeles",
    level: 'unhealthy', aqi: 125, radius: 90000, population: 18700000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'up', pm25: 55, pm10: 85, no2: 48, so2: 22, co: 2.8, o3: 105
  },
  {
    id: 'houston-01', lat: 29.7604, lng: -95.3698, name: "Houston Metro", city: "Houston",
    level: 'unhealthy', aqi: 118, radius: 65000, population: 7100000, dominantPollutant: 'O3',
    lastUpdated: '2 min ago', trend: 'stable', pm25: 52, pm10: 78, no2: 45, so2: 20, co: 2.5, o3: 98
  },
  {
    id: 'newyork-01', lat: 40.7128, lng: -74.0060, name: "New York Metro", city: "New York",
    level: 'unhealthy', aqi: 112, radius: 80000, population: 20100000, dominantPollutant: 'PM2.5',
    lastUpdated: '3 min ago', trend: 'up', pm25: 50, pm10: 75, no2: 52, so2: 24, co: 2.6, o3: 85
  },
  {
    id: 'sanbernadino-01', lat: 34.1083, lng: -117.2898, name: "San Bernardino-Riverside", city: "San Bernardino",
    level: 'unhealthy', aqi: 128, radius: 55000, population: 4600000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'up', pm25: 58, pm10: 88, no2: 46, so2: 21, co: 2.9, o3: 108
  },
  {
    id: 'bakersfield-01', lat: 35.3733, lng: -119.0187, name: "Bakersfield Area", city: "Bakersfield",
    level: 'unhealthy', aqi: 115, radius: 40000, population: 900000, dominantPollutant: 'PM2.5',
    lastUpdated: '4 min ago', trend: 'stable', pm25: 48, pm10: 72, no2: 42, so2: 18, co: 2.4, o3: 90
  },

  // Very Unhealthy zones (dark red) - Rare in North America
  {
    id: 'fresno-01', lat: 36.7378, lng: -119.7871, name: "Fresno Valley", city: "Fresno",
    level: 'very_unhealthy', aqi: 165, radius: 45000, population: 1000000, dominantPollutant: 'PM2.5',
    lastUpdated: '1 min ago', trend: 'up', pm25: 75, pm10: 112, no2: 55, so2: 28, co: 3.5, o3: 95
  },
  {
    id: 'saltlake-01', lat: 40.7608, lng: -111.8910, name: "Salt Lake Valley (Inversion)", city: "Salt Lake City",
    level: 'very_unhealthy', aqi: 158, radius: 40000, population: 1200000, dominantPollutant: 'PM2.5',
    lastUpdated: '2 min ago', trend: 'stable', pm25: 70, pm10: 105, no2: 52, so2: 25, co: 3.2, o3: 88
  },

  // Industrial zones with higher pollution
  {
    id: 'pittsburgh-01', lat: 40.4406, lng: -79.9959, name: "Pittsburgh Industrial", city: "Pittsburgh",
    level: 'unhealthy', aqi: 108, radius: 45000, population: 2400000, dominantPollutant: 'PM2.5',
    lastUpdated: '1 min ago', trend: 'up', pm25: 48, pm10: 72, no2: 48, so2: 28, co: 2.4, o3: 75
  },
  {
    id: 'detroit-01', lat: 42.3314, lng: -83.0458, name: "Detroit Metro", city: "Detroit",
    level: 'moderate', aqi: 88, radius: 55000, population: 4300000, dominantPollutant: 'O3',
    lastUpdated: '3 min ago', trend: 'stable', pm25: 42, pm10: 65, no2: 38, so2: 20, co: 1.8, o3: 78
  },

  // Additional regions for better coverage
  {
    id: 'miami-01', lat: 25.7617, lng: -80.1918, name: "Miami-Fort Lauderdale", city: "Miami",
    level: 'good', aqi: 52, radius: 60000, population: 6200000, dominantPollutant: 'O3',
    lastUpdated: '2 min ago', trend: 'down', pm25: 18, pm10: 32, no2: 22, so2: 10, co: 0.9, o3: 52
  },
  {
    id: 'toronto-01', lat: 43.6532, lng: -79.3832, name: "Greater Toronto Area", city: "Toronto",
    level: 'moderate', aqi: 62, radius: 70000, population: 6400000, dominantPollutant: 'O3',
    lastUpdated: '1 min ago', trend: 'stable', pm25: 28, pm10: 45, no2: 28, so2: 14, co: 1.2, o3: 62
  },
  {
    id: 'montreal-01', lat: 45.5017, lng: -73.5673, name: "Montreal Metro", city: "Montreal",
    level: 'good', aqi: 48, radius: 55000, population: 4300000, dominantPollutant: 'PM2.5',
    lastUpdated: '4 min ago', trend: 'stable', pm25: 16, pm10: 28, no2: 20, so2: 8, co: 0.8, o3: 42
  }
];

// Helper function to get color based on AQI level or number
export const getAQIColor = (input: string | number): string => {
  // If input is a number, convert to level
  if (typeof input === 'number') {
    if (input <= 50) return 'bg-green-500';      // Good
    if (input <= 100) return 'bg-yellow-500';    // Moderate
    if (input <= 150) return 'bg-orange-500';    // Unhealthy for Sensitive Groups
    if (input <= 200) return 'bg-red-500';       // Unhealthy
    if (input <= 300) return 'bg-purple-500';    // Very Unhealthy
    return 'bg-red-900';                          // Hazardous
  }

  // If input is a string level
  switch (input) {
    case 'good': return 'bg-green-500';
    case 'moderate': return 'bg-yellow-500';
    case 'unhealthy': return 'bg-orange-500';
    case 'very_unhealthy': return 'bg-red-500';
    case 'hazardous': return 'bg-red-900';
    default: return 'bg-gray-500';
  }
};

// Helper function to get text color based on AQI level
export const getAQITextColor = (input: string | number): string => {
  if (typeof input === 'number') {
    if (input <= 50) return 'text-green-400';
    if (input <= 100) return 'text-yellow-400';
    if (input <= 150) return 'text-orange-400';
    if (input <= 200) return 'text-red-400';
    if (input <= 300) return 'text-purple-400';
    return 'text-red-300';
  }

  switch (input) {
    case 'good': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'unhealthy': return 'text-orange-400';
    case 'very_unhealthy': return 'text-red-400';
    case 'hazardous': return 'text-red-300';
    default: return 'text-gray-400';
  }
};

export const getPollutantColor = (level: string): string => {
  switch (level) {
    case 'good': return '#10b981';
    case 'moderate': return '#f59e0b';
    case 'unhealthy': return '#f97316';
    case 'hazardous': return '#dc2626';
    default: return '#6b7280';
  }
};