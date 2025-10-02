require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const airQualityRoutes = require('./routes/airQuality.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const quizRoutes = require('./routes/quiz.routes');
const ngoRoutes = require('./routes/ngo.routes');
const notificationRoutes = require('./routes/notification.routes');
const userRoutes = require('./routes/user.routes');
const searchRoutes = require('./routes/search.routes');
const wildfireRoutes = require('./routes/wildfire.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Headers:`, JSON.stringify(req.headers));
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Air Quality API Server' });
});

console.log('=== Mounting auth routes at /api/auth ===');
app.use('/api/auth', authRoutes);
console.log('=== Auth routes mounted successfully ===');

console.log('=== Mounting air quality routes at /api/air-quality ===');
app.use('/api/air-quality', airQualityRoutes);
console.log('=== Air quality routes mounted successfully ===');

console.log('=== Mounting chatbot routes at /api/chatbot ===');
app.use('/api/chatbot', chatbotRoutes);
console.log('=== Chatbot routes mounted successfully ===');

console.log('=== Mounting quiz routes at /api/quiz ===');
app.use('/api/quiz', quizRoutes);
console.log('=== Quiz routes mounted successfully ===');

console.log('=== Mounting NGO routes at /api/ngo ===');
app.use('/api/ngo', ngoRoutes);
console.log('=== NGO routes mounted successfully ===');

console.log('=== Mounting notification routes at /api/notifications ===');
app.use('/api/notifications', notificationRoutes);
console.log('=== Notification routes mounted successfully ===');

console.log('=== Mounting user routes at /api/user ===');
app.use('/api/user', userRoutes);
console.log('=== User routes mounted successfully ===');

console.log('=== Mounting search routes at /api/search ===');
app.use('/api/search', searchRoutes);
console.log('=== Search routes mounted successfully ===');

console.log('=== Mounting wildfire routes at /api/wildfire ===');
app.use('/api/wildfire', wildfireRoutes);
console.log('=== Wildfire routes mounted successfully ===');

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
