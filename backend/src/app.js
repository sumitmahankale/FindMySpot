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
require('./models/index');

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

// Static file serving placeholder (if needed for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply basic rate limiting then mount routes
app.use(rateLimit, routes);

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
