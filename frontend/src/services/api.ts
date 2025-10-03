import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nsac-mu.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Check for both user token and NGO token
    const token = localStorage.getItem('token') || localStorage.getItem('ngoToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - check which type and redirect accordingly
      const isNGO = localStorage.getItem('ngoToken');

      // Clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('ngoToken');
      localStorage.removeItem('ngoData');

      // Redirect to appropriate login
      if (isNGO) {
        window.location.href = '/ngo/login';
      } else {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
