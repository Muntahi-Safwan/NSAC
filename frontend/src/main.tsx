import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router'
import { router } from './routes/Routes.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext.tsx'
import { AirQualityProvider } from './contexts/AirQualityContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <AirQualityProvider autoRefreshInterval={5 * 60 * 1000}>
          <RouterProvider router={router} />
        </AirQualityProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
