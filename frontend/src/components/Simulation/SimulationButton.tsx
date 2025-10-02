import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';

interface SimulationButtonProps {
  onClick: () => void;
}

const SimulationButton: React.FC<SimulationButtonProps> = ({ onClick }) => {
  const { simulation, stopSimulation } = useSimulation();

  const handleClick = () => {
    if (simulation.isActive) {
      stopSimulation();
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-6 py-3 font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
        simulation.isActive
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/50'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/50'
      } text-white`}
    >
      {simulation.isActive ? (
        <>
          <RotateCcw className="w-5 h-5" />
          Reset
        </>
      ) : (
        <>
          <Play className="w-5 h-5" />
          Simulation
        </>
      )}
    </button>
  );
};

export default SimulationButton;
