import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import axios from 'axios';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose }) => {
  const { simulation, startSimulation } = useSimulation();
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateAIInsights();
    }
  }, [isOpen]);

  const generateAIInsights = async () => {
    setLoading(true);
    try {
      const prompt = `You are a health advisor AI. Based on the following scenario, provide a concise health risk assessment (2-3 sentences):

Person Profile:
- Age: ${simulation.userData.age} years old
- Health Conditions: ${simulation.userData.diseases.join(', ')}
- Location: ${simulation.userData.location}

Current Air Quality:
- Air Quality Index (AQI): ${simulation.airQualityData.aqi} (Hazardous)
- PM2.5 Level: ${simulation.airQualityData.pm25} μg/m³
- Pollutants: ${simulation.airQualityData.pollutants.join(', ')}

Provide immediate health risks and urgent recommendations.`;

      const response = await axios.post('http://localhost:3000/api/ai/generate', {
        prompt,
        options: {
          maxTokens: 200,
          temperature: 0.7
        }
      });

      setAiInsights(response.data.text);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setAiInsights('For an 80-year-old individual with Asthma and COPD, the current hazardous air quality (AQI 250, PM2.5 180 μg/m³) poses severe health risks including respiratory distress, increased risk of heart attack, and potential hospitalization. Immediate action is critical: stay indoors, use air purifiers, take prescribed medications, and seek medical attention if breathing difficulties worsen.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = () => {
    startSimulation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-orange-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hazard Simulation</h2>
              <p className="text-red-100 text-sm">Air Quality Emergency Scenario</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scenario Details */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">Simulation Parameters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Person Profile */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-300">Person Profile</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p><span className="text-gray-400">Age:</span> {simulation.userData.age} years old</p>
                  <p><span className="text-gray-400">Health Conditions:</span></p>
                  <ul className="list-disc list-inside pl-2">
                    {simulation.userData.diseases.map((disease, idx) => (
                      <li key={idx}>{disease}</li>
                    ))}
                  </ul>
                  <p><span className="text-gray-400">Location:</span> {simulation.userData.location}</p>
                </div>
              </div>

              {/* Air Quality Data */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-300">Air Quality Data</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p><span className="text-gray-400">AQI:</span> <span className="text-red-400 font-bold">{simulation.airQualityData.aqi}</span> (Hazardous)</p>
                  <p><span className="text-gray-400">PM2.5:</span> <span className="text-orange-400 font-bold">{simulation.airQualityData.pm25} μg/m³</span></p>
                  <p><span className="text-gray-400">Pollutants:</span></p>
                  <div className="flex flex-wrap gap-1">
                    {simulation.airQualityData.pollutants.map((pollutant, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-500/20 border border-red-400/30 rounded text-xs text-red-300">
                        {pollutant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              AI Health Risk Assessment
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="ml-3 text-gray-300">Generating insights...</span>
              </div>
            ) : (
              <p className="text-gray-200 leading-relaxed">{aiInsights}</p>
            )}
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
            <p className="text-sm text-yellow-200">
              <span className="font-semibold">Note:</span> This simulation will activate hazard alerts, change the banner to red,
              and display sequential safety notifications. You can stop the simulation at any time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSimulation}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationModal;
