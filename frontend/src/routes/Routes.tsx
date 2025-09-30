import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/HomePage/Home";
import MapPage from "../pages/MapPage/MapPage";
import About from "../pages/AboutPage/About";
import Contact from "../pages/ContactPage/Contact";
import Learning from "../pages/LearningPage/Learning";
import ArticlePage from "../pages/ArticlePage/ArticlePage";
import Profile from "../pages/ProfilePage/Profile";
import Login from "../pages/AuthPage/Login";
import Signup from "../pages/AuthPage/Signup";
import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedRoute from "../components/ProtectedRoute";

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
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
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
    }
]);