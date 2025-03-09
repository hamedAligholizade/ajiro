require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { sequelize } = require('./models');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

console.log(`Starting backend server in ${process.env.NODE_ENV || 'development'} mode`);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request body for debugging in development (but not passwords)
  if (process.env.NODE_ENV === 'development' && req.body) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[REDACTED]';
    console.log('Request body:', logBody);
  }
  
  // Log response time on completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Apply middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  credentials: true
}));

// Configure helmet with less restrictive settings for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Parse JSON requests with increased size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Import routes
const indexRoutes = require('./routes/index');

// Apply routes
app.use('/', indexRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Send appropriate error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.details || err
    } : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models
    console.log('Syncing database models...');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database sync completed.');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Ajiro backend server running on port ${PORT}`);
      console.log(`API Endpoints available at http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit with error code
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in development
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

startServer(); 