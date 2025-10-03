import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UnifiedBackground from "../components/UnifiedBackground";
import ErrorBoundary from "../components/ErrorBoundary";
import SimulationButton from "../components/Simulation/SimulationButton";
import SimulationModal from "../components/Simulation/SimulationModal";
import SimulationToastContainer from "../components/Simulation/SimulationToastContainer";
import NotificationPermissionBanner from "../components/NotificationPermissionBanner";

export default function RootLayout() {
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Unified background for entire app */}
      <UnifiedBackground />

      {/* Content overlay */}
      <div className="relative z-10">
        <Navbar />

        {/* Main content with padding for banner (40px) + navbar (80px) = 120px = pt-30 */}
        <main className="pt-30">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>

      {/* Simulation Components */}
      <SimulationButton onClick={() => setIsSimulationModalOpen(true)} />
      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
      />
      <SimulationToastContainer />

      {/* Push Notification Permission Banner */}
      <NotificationPermissionBanner />
    </div>
  );
}