import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UnifiedBackground from "../components/UnifiedBackground";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
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
    </div>
  );
}