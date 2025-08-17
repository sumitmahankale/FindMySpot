/* eslint-env node */
// Central router aggregator
const express = require('express');
const authRoutes = require('./auth');
const userQueryRoutes = require('./userQueries');
const parkingSpaceRoutes = require('./parkingSpaces');
const bookingRoutes = require('./bookings');
const listerQueryRoutes = require('./listerQueries');
const parkingRequestRoutes = require('./parkingRequests');
const adminStatsRoutes = require('./adminStats');
const utilityRoutes = require('./utility');
const listersPublicRoutes = require('./listers');

const router = express.Router();

router.use('/api', authRoutes);
router.use('/api', userQueryRoutes);
router.use('/api', parkingSpaceRoutes);
router.use('/api', bookingRoutes);
router.use('/api', listerQueryRoutes);
router.use('/api', parkingRequestRoutes);
router.use('/api', adminStatsRoutes);
router.use('/api', utilityRoutes);
router.use('/api', listersPublicRoutes);

module.exports = router;
