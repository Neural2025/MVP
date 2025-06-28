const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const analysisRoutes = require('./routes/analysis');
const authRoutes = require('./routes/auth');
const bugReportsRoutes = require('./routes/bugReports');
const exportRoutes = require('./routes/export');
const teamRoutes = require('./routes/team');
const testSuiteRoutes = require('./routes/testSuite');

const app = express();
const PORT = process.env.PORT || 3001;


const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-automation';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    logger.warn('Server will continue without database functionality');
    // Don't exit, continue without MongoDB
  }
};

// Connect to MongoDB (non-blocking)
connectDB();


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));


app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(rateLimiter);


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', analysisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bug-reports', bugReportsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/test-suites', testSuiteRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'AI QA Assistant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      analysis: '/api/analyze',
      tests: '/api/generate-tests',
      apiTest: '/api/test-api-key',
      health: '/health'
    }
  });
});


app.use(errorHandler);


app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  logger.info(`Test Automation System running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
