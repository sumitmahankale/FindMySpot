/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { ParkingSpace, Lister, Booking } = require('../models');
const jwt = require('jsonwebtoken');
// Optional auth: if token provided and valid, attaches req.user; otherwise continues anonymously
function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'insecure-dev-secret'); } catch (_) { /* ignore */ }
  next();
}
const router = express.Router();

// Helper to build list (reused by alias)
async function listSpaces(req, res) {
  try {
    const { location, q } = req.query;
    const where = {};
    if (q) where.name = { [Sequelize.Op.like]: `%${q}%` };
    if (location) where.location = { [Sequelize.Op.like]: `%${location}%` };
    try {
      const spaces = await ParkingSpace.findAll({ where, include: [{ model: Lister, attributes: ['id','fullName','businessName','email','phone'] }] });
      return res.json(spaces);
    } catch (inner) {
      // Fallback: attribute mismatch (e.g., production DB column naming) – retry without explicit attributes
      console.warn('[parking-spaces] initial query failed, retrying without attribute list:', inner.message);
      const spaces = await ParkingSpace.findAll({ where, include: [{ model: Lister }] });
      return res.json(spaces);
    }
  } catch (e) {
    console.error('[parking-spaces] fatal fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch parking spaces', details: e.message });
  }
}

// List parking spaces with basic filters
router.get('/parking-spaces', listSpaces);
// Legacy/alternate alias used by frontend (parking-entries)
router.get('/parking-entries', listSpaces);

// Create parking space (lister)
router.post('/parking-spaces', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'lister') return res.status(403).json({ error: 'Only listers can create parking spaces' });
    const { name, contact, location, price, availability, description, lat, lng } = req.body;
    if (!name || !location || !price || !contact || lat === undefined || lng === undefined) return res.status(400).json({ error: 'Missing required fields' });
    const space = await ParkingSpace.create({ name, contact, location, price, availability: availability || 'Not specified', description, lat, lng, listerId: req.user.id });
    res.status(201).json(space);
  } catch (e) { res.status(500).json({ error: 'Failed to create parking space', details: e.message }); }
});
// Alias
router.post('/parking-entries', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'lister') return res.status(403).json({ error: 'Only listers can create parking spaces' });
    const { name, contact, location, price, availability, description, lat, lng } = req.body;
    if (!name || !location || !price || !contact || lat === undefined || lng === undefined) return res.status(400).json({ error: 'Missing required fields' });
    const space = await ParkingSpace.create({ name, contact, location, price, availability: availability || 'Not specified', description, lat, lng, listerId: req.user.id });
    res.status(201).json(space);
  } catch (e) { res.status(500).json({ error: 'Failed to create parking space', details: e.message }); }
});

// Update parking space
router.put('/parking-spaces/:id', authenticateToken, async (req, res) => {
  try {
    const space = await ParkingSpace.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'lister' || space.listerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await space.update(req.body);
    res.json(space);
  } catch (e) { res.status(500).json({ error: 'Failed to update parking space', details: e.message }); }
});
router.put('/parking-entries/:id', authenticateToken, async (req, res) => {
  try {
    const space = await ParkingSpace.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'lister' || space.listerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await space.update(req.body);
    res.json(space);
  } catch (e) { res.status(500).json({ error: 'Failed to update parking space', details: e.message }); }
});

// Delete parking space
router.delete('/parking-spaces/:id', authenticateToken, async (req, res) => {
  try {
    const space = await ParkingSpace.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'lister' || space.listerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await space.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete parking space', details: e.message }); }
});
router.delete('/parking-entries/:id', authenticateToken, async (req, res) => {
  try {
    const space = await ParkingSpace.findByPk(req.params.id);
    if (!space) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'lister' || space.listerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await space.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete parking space', details: e.message }); }
});

// Lister-specific listing
router.get('/lister/:listerId/parking-spaces', authenticateToken, async (req, res) => {
  try {
    const listerId = parseInt(req.params.listerId, 10);
    if (Number.isNaN(listerId)) return res.status(400).json({ error: 'Invalid lister ID' });
    // Allow lister owner or admin
    if (req.user.id !== listerId && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access' });
    const spaces = await ParkingSpace.findAll({ where: { listerId }, include: [{ model: Lister, attributes: ['id','fullName','businessName','email'] }], order: [['createdAt','DESC']] });
    res.json(spaces);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch lister parking spaces', details: e.message }); }
});

// Availability endpoint: returns bookings for a space (basic)
router.get('/parking-spaces/:id/availability', optionalAuth, async (req, res) => {
  try {
    const spaceId = parseInt(req.params.id, 10);
    if (Number.isNaN(spaceId)) return res.status(400).json({ error: 'Invalid space ID' });
    const space = await ParkingSpace.findByPk(spaceId);
    if (!space) return res.status(404).json({ error: 'Not found' });

    const { date, startTime, endTime } = req.query;
    const where = { parkingSpaceId: spaceId };
    if (date) where.bookingDate = date; // expect YYYY-MM-DD

    const bookings = await Booking.findAll({ where, order: [['startTime','ASC']] });

    let available = true;
    let conflictCount = 0;
    let conflicts = [];

    if (date && startTime && endTime) {
      // Determine overlaps on same date
      const reqStart = startTime;
      const reqEnd = endTime;
      conflicts = bookings.filter(b => {
        // Overlap if NOT (requested ends before booking starts OR requested starts after booking ends)
        return !(reqEnd <= b.startTime || reqStart >= b.endTime);
      });
      conflictCount = conflicts.length;
      available = conflictCount === 0;
    }

    return res.json({
      spaceId,
      requested: { date: date || null, startTime: startTime || null, endTime: endTime || null },
      available,
      conflictCount,
      conflicts,
      bookings
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch availability', details: e.message });
  }
});


module.exports = router;
