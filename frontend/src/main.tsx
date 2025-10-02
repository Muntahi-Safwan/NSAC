import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router'
import { router } from './routes/Routes.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { NGOAuthProvider } from './contexts/NGOAuthContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext.tsx'
import { AirQualityProvider } from './contexts/AirQualityContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NGOAuthProvider>
        <NotificationProvider>
          <AirQualityProvider autoRefreshInterval={5 * 60 * 1000}>
            <RouterProvider router={router} />
          </AirQualityProvider>
        </NotificationProvider>
      </NGOAuthProvider>
    </AuthProvider>
  </StrictMode>,
)
