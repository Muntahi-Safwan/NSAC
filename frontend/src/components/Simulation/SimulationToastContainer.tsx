import React, { useEffect, useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import SimulationToast from './SimulationToast';

const SimulationToastContainer: React.FC = () => {
  const { simulation, addAlert, clearAlerts } = useSimulation();
  const [displayedAlerts, setDisplayedAlerts] = useState<typeof simulation.alerts>([]);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (simulation.isActive && !hasStarted) {
      setHasStarted(true);
      clearAlerts();
      showSequentialAlerts();
    } else if (!simulation.isActive && hasStarted) {
      setHasStarted(false);
      setDisplayedAlerts([]);
    }
  }, [simulation.isActive]);

  const showSequentialAlerts = () => {
    const alerts = [
      {
        type: 'critical' as const,
        message: '🚨 CRITICAL ALERT: Air Quality Index has reached hazardous levels (AQI 250). Immediate action required for all residents, especially vulnerable populations.'
      },
      {
        type: 'danger' as const,
        message: '⚠️ HEALTH WARNING: PM2.5 levels at 180 μg/m³. Individuals with asthma, COPD, or cardiovascular conditions must stay indoors immediately.'
      },
      {
        type: 'warning' as const,
        message: '🏥 MEDICAL ALERT: If you experience breathing difficulties, chest pain, or severe coughing, seek emergency medical attention immediately.'
      },
      {
        type: 'warning' as const,
        message: '🏠 SAFETY RECOMMENDATION: Keep all windows and doors closed. Use air purifiers if available. Avoid all outdoor activities.'
      },
      {
        type: 'info' as const,
        message: '💊 MEDICATION REMINDER: Take prescribed respiratory medications as directed. Have emergency inhalers readily accessible.'
      },
      {
        type: 'info' as const,
        message: '📱 EMERGENCY CONTACTS: Local emergency services: 999. Air quality hotline available 24/7 for guidance and support.'
      }
    ];

    alerts.forEach((alert, index) => {
      setTimeout(() => {
        addAlert(alert);
      }, index * 3000); // 3 seconds between each alert
    });
  };

  useEffect(() => {
    setDisplayedAlerts(simulation.alerts);
  }, [simulation.alerts]);

  const handleCloseToast = (id: string) => {
    setDisplayedAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (!simulation.isActive || displayedAlerts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-md">
      {displayedAlerts.map((alert) => (
        <SimulationToast
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={handleCloseToast}
          duration={8000}
        />
      ))}
    </div>
  );
};

export default SimulationToastContainer;
