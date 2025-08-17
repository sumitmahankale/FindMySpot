/* eslint-env node */
// Load environment variables
require('dotenv').config();

// Central Express application setup using modular structure
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { sequelize } = require('./config/db');
// Import models to ensure associations are registered
require('./models');

const routes = require('./routes');
const rateLimit = require('./middleware/rateLimit');

const app = express();

// Basic security + parsing middleware
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(bodyParser.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch (error) {
    // Provide softer failure in development when DB not configured
    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({
        status: 'degraded',
        database: 'disconnected',
        note: 'Database not connected (development fallback). Set env vars for full check.',
        error: error.message
      });
    }
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Extended DB diagnostics (avoid exposing in production without auth)
app.get('/api/health/db/extended', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden in production' });
  }
  try {
    const start = Date.now();
    await sequelize.authenticate();
    const duration = Date.now() - start;
    // Simple ping query depending on dialect
    let pingResult = null;
    try {
      pingResult = await sequelize.query('SELECT 1 AS ping');
    } catch (e) {
      pingResult = { error: e.message };
    }
    res.json({
      status: 'ok',
      latencyMs: duration,
      dialect: sequelize.getDialect(),
      configHost: process.env.DB_HOST || process.env.MYSQLHOST || null,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || null,
      pool: {
        max: sequelize.options.pool.max,
        min: sequelize.options.pool.min,
        idle: sequelize.options.pool.idle,
        acquire: sequelize.options.pool.acquire
      },
      pingResult: Array.isArray(pingResult) ? pingResult[0] : pingResult
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Test endpoint to check if routing works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend routing is working!', timestamp: new Date().toISOString() });
});

// Static file serving placeholder (if needed for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply basic rate limiting then mount routes
app.use(rateLimit, routes);

// Root route (informational) to avoid Not Found when visiting base URL
app.get('/', (req, res) => {
  res.json({
    service: 'FindMySpot API',
    status: 'ok',
    health: '/api/health',
    dbHealth: '/api/health/db',
    docs: 'Add API docs endpoint later'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server only if executed directly (not in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  console.log('Starting server setup...');
  // Expect schema to be managed via migrations (npm run db:migrate before start)
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established');
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on ${PORT} (all interfaces)`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
      });
      
      server.on('error', (err) => {
        console.error('Server error:', err);
      });
    })
    .catch(err => {
      console.error('Database connection failed:', err);
      process.exit(1);
    });
}

module.exports = app;
