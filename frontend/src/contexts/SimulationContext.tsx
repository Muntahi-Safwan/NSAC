import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SimulationState {
  isActive: boolean;
  userData: {
    age: number;
    diseases: string[];
    location: string;
  };
  airQualityData: {
    aqi: number;
    pm25: number;
    pollutants: string[];
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'danger' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

interface SimulationContextType {
  simulation: SimulationState;
  startSimulation: () => void;
  stopSimulation: () => void;
  addAlert: (alert: Omit<SimulationState['alerts'][0], 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [simulation, setSimulation] = useState<SimulationState>({
    isActive: false,
    userData: {
      age: 80,
      diseases: ['Asthma', 'Chronic Obstructive Pulmonary Disease (COPD)'],
      location: 'Mirpur, Dhaka'
    },
    airQualityData: {
      aqi: 250,
      pm25: 180,
      pollutants: ['PM2.5', 'PM10', 'NO2', 'O3']
    },
    alerts: []
  });

  const startSimulation = () => {
    setSimulation(prev => ({ ...prev, isActive: true, alerts: [] }));
  };

  const stopSimulation = () => {
    setSimulation(prev => ({ ...prev, isActive: false, alerts: [] }));
  };

  const addAlert = (alert: Omit<SimulationState['alerts'][0], 'id' | 'timestamp'>) => {
    const newAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setSimulation(prev => ({
      ...prev,
      alerts: [...prev.alerts, newAlert]
    }));
  };

  const clearAlerts = () => {
    setSimulation(prev => ({ ...prev, alerts: [] }));
  };

  return (
    <SimulationContext.Provider
      value={{ simulation, startSimulation, stopSimulation, addAlert, clearAlerts }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};
