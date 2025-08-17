/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { Booking, ParkingSpace, User, Lister } = require('../models');
const router = express.Router();

// Create booking (user)
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only users can create bookings' });
    const { parkingSpaceId, startTime, endTime, vehicleInfo, notes } = req.body;
    if (!parkingSpaceId || !startTime || !endTime) return res.status(400).json({ error: 'Missing required fields' });
    const space = await ParkingSpace.findByPk(parkingSpaceId);
    if (!space) return res.status(404).json({ error: 'Parking space not found' });
    const overlapping = await Booking.findOne({ where: { parkingSpaceId, [Sequelize.Op.or]: [ { startTime: { [Sequelize.Op.between]: [startTime, endTime] } }, { endTime: { [Sequelize.Op.between]: [startTime, endTime] } } ] } });
    if (overlapping) return res.status(409).json({ error: 'Time slot already booked' });
    // Derive listerId from space, parse price numeric portion
    const listerId = space.listerId;
    // Simple amount calculation: duration hours * numeric price (if price available)
    let totalAmount = 0;
    if (space.price) {
      const numericPrice = parseFloat(String(space.price).replace(/[^0-9.]/g, '')) || 0; // assume hourly
      const start = new Date(`1970-01-01T${startTime}Z`);
      const end = new Date(`1970-01-01T${endTime}Z`);
      const hours = Math.max(0.5, (end - start) / (1000 * 60 * 60));
      totalAmount = Number((numericPrice * hours).toFixed(2));
    }
    const bookingDate = new Date();
    const booking = await Booking.create({ bookingDate, parkingSpaceId, startTime, endTime, userId: req.user.id, listerId, totalAmount, vehicleInfo, notes, status: 'pending' });
    res.status(201).json(booking);
  } catch (e) { res.status(500).json({ error: 'Failed to create booking', details: e.message }); }
});

// List bookings (role aware)
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'user') where.userId = req.user.id;
    else if (req.user.role === 'lister') where.listerId = req.user.id;
    const bookings = await Booking.findAll({ where, include: [ { model: ParkingSpace }, { model: User, attributes: ['id','fullName','email'] }, { model: Lister, attributes: ['id','fullName','businessName','email'] } ], order: [['createdAt','DESC']] });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch bookings', details: e.message }); }
});

// User-specific convenience route
router.get('/user/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only users can view this list' });
    const bookings = await Booking.findAll({ where: { userId: req.user.id }, include: [ParkingSpace], order: [['createdAt','DESC']] });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch user bookings', details: e.message }); }
});

// Lister-specific convenience route
router.get('/lister/bookings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'lister') return res.status(403).json({ error: 'Only listers can view this list' });
    const bookings = await Booking.findAll({ where: { listerId: req.user.id }, include: [User, ParkingSpace], order: [['createdAt','DESC']] });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch lister bookings', details: e.message }); }
});

// Update booking status (admin or lister for their spaces)
router.put('/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    const allowed = ['pending','confirmed','completed','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const isOwner = booking.userId === req.user.id;
    const isLister = booking.listerId === req.user.id && req.user.role === 'lister';
    const isAdmin = req.user.role === 'admin';
    if (!(isOwner || isLister || isAdmin)) return res.status(403).json({ error: 'Forbidden' });
    // Users can only cancel their own (not confirm/complete)
    if (req.user.role === 'user' && status !== 'cancelled') return res.status(403).json({ error: 'Users can only cancel their own bookings' });
    await booking.update({ status });
    res.json({ message: 'Status updated', booking });
  } catch (e) { res.status(500).json({ error: 'Failed to update booking', details: e.message }); }
});

// Cancel booking (explicit route for clarity)
router.put('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    if (booking.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed booking' });
    await booking.update({ status: 'cancelled' });
    res.json({ message: 'Cancelled', booking });
  } catch (e) { res.status(500).json({ error: 'Failed to cancel booking', details: e.message }); }
});

// Update payment status (lister/admin)
router.put('/bookings/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['pending','paid','refunded'].includes(paymentStatus)) return res.status(400).json({ error: 'Invalid payment status' });
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    const isLister = booking.listerId === req.user.id && req.user.role === 'lister';
    const isAdmin = req.user.role === 'admin';
    if (!(isLister || isAdmin)) return res.status(403).json({ error: 'Forbidden' });
    await booking.update({ paymentStatus });
    res.json({ message: 'Payment status updated', booking });
  } catch (e) { res.status(500).json({ error: 'Failed to update payment status', details: e.message }); }
});

// Availability moved to utility, keep lightweight alias if needed
router.get('/parking-spaces/:id/availability', require('../routes/utility'));

module.exports = router;
