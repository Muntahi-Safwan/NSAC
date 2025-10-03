import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/HomePage/Home";
import MapPage from "../pages/MapPage/MapPage";
import HeatwaveMap from "../pages/MapPage/HeatwaveMap";
import WildfireMap from "../pages/MapPage/WildfireMap";
import About from "../pages/AboutPage/About";
import Contact from "../pages/ContactPage/Contact";
import Learning from "../pages/LearningPage/Learning";
import ArticlePage from "../pages/ArticlePage/ArticlePage";
import Profile from "../pages/ProfilePage/Profile";
import Login from "../pages/AuthPage/Login";
import Signup from "../pages/AuthPage/Signup";
import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedRoute from "../components/ProtectedRoute";
import NGOLogin from "../pages/NGO/NGOLogin";
import NGORegister from "../pages/NGO/NGORegister";
import NGODashboard from "../pages/NGO/NGODashboard";
import QuizPage from "../pages/QuizPage/QuizPage";
import UserDashboard from "../pages/User/UserDashboard";
import SearchPage from "../pages/SearchPage/SearchPage";
import AnalyticsDashboard from "../pages/Analytics/AnalyticsDashboard";
import HowWeBuiltIt from "../pages/HowWeBuiltItPage/HowWeBuiltIt";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorBoundary><div /></ErrorBoundary>,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/map",
                element: <MapPage />
            },
            {
                path: "/map/heatwave",
                element: <HeatwaveMap />
            },
            {
                path: "/map/wildfire",
                element: <WildfireMap />
            },
            {
                path: "/search",
                element: <SearchPage />
            },
            {
                path: "/analytics",
                element: <AnalyticsDashboard />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/contact",
                element: <Contact />
            },
            {
                path: "/learning",
                element: <Learning />
            },
            {
                path: "/learning/:type/:id",
                element: <ArticlePage />
            },
            {
                path: "/quiz",
                element: <QuizPage />
            },
            {
                path: "/how-we-built-it",
                element: <HowWeBuiltIt />
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <UserDashboard />
                    </ProtectedRoute>
                )
            }
        ]
    },
    {
        path: "/auth/login",
        element: <Login />
    },
    {
        path: "/auth/signup",
        element: <Signup />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/ngo/login",
        element: <NGOLogin />
    },
    {
        path: "/ngo/register",
        element: <NGORegister />
    },
    {
        path: "/ngo/dashboard",
        element: <NGODashboard />
    }
]);