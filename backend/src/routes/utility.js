/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { ParkingSpace, Lister, User, Booking } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Search parking spaces by location or coordinates
router.get('/search-parking', async (req, res) => {
  try {
    const { query, lat, lng, radius } = req.query;
    const where = { isActive: true };
    if (query) where.location = { [Sequelize.Op.like]: `%${query}%` };
    const spaces = await ParkingSpace.findAll({ where, include: [{ model: Lister, attributes: ['id','fullName','businessName','phone'] }], order: [['createdAt','DESC']] });
    if (lat && lng && radius) {
      const R = 6371; // km
      const toRad = d => d * Math.PI / 180;
      const filtered = spaces.filter(sp => {
        const dLat = toRad(sp.lat - parseFloat(lat));
        const dLng = toRad(sp.lng - parseFloat(lng));
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(parseFloat(lat))) * Math.cos(toRad(sp.lat)) * Math.sin(dLng/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c <= parseFloat(radius);
      });
      return res.json(filtered);
    }
    res.json(spaces);
  } catch (e) { res.status(500).json({ error: 'Failed to search parking spaces', details: e.message }); }
});

// Location suggestions
router.get('/location-suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) return res.json([]);
    const spaces = await ParkingSpace.findAll({ where: { location: { [Sequelize.Op.like]: `%${query}%` }, isActive: true }, attributes: ['id','location','lat','lng'], limit: 8, order: [[Sequelize.literal(`CASE WHEN location LIKE '${query}%' THEN 1 ELSE 2 END`),'ASC'], ['location','ASC']] });
    const seen = new Set();
    const unique = [];
    spaces.forEach(sp => { const k = sp.location.toLowerCase(); if (!seen.has(k)) { seen.add(k); unique.push(sp); } });
    res.json(unique);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch location suggestions', details: e.message }); }
});

// (Legacy) Simple availability path retained for backward compatibility (delegates to main route)
router.get('/parking-spaces/:id/availability-legacy', async (req, res) => {
  try {
    const { id } = req.params; const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) return res.status(400).json({ error: 'Date, start time, and end time are required' });
    const conflicts = await Booking.findAll({ where: { parkingSpaceId: id, bookingDate: date, status: { [Sequelize.Op.ne]: 'cancelled' }, startTime: { [Sequelize.Op.lt]: endTime }, endTime: { [Sequelize.Op.gt]: startTime } } });
    res.json({ available: conflicts.length === 0, conflictCount: conflicts.length });
  } catch (e) { res.status(500).json({ error: 'Failed to check availability', details: e.message }); }
});

// Reset password (user or lister)
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword, userType } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required' });
    let account;
    if (userType === 'lister') account = await Lister.findOne({ where: { email } });
    else if (userType === 'user') account = await User.findOne({ where: { email } });
    else { account = await User.findOne({ where: { email } }) || await Lister.findOne({ where: { email } }); }
    if (!account) return res.status(404).json({ error: 'No account found with this email' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await account.update({ password: hashed });
    res.json({ message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: 'Failed to reset password', details: e.message }); }
});

module.exports = router;
