/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { ParkingSpace, Lister, Booking } = require('../models');
const router = express.Router();

// List parking spaces with basic filters
router.get('/parking-spaces', async (req, res) => {
  try {
    const { location, q } = req.query;
    const where = {};
    if (q) where.name = { [Sequelize.Op.like]: `%${q}%` };
    if (location) where.location = { [Sequelize.Op.like]: `%${location}%` };
    const spaces = await ParkingSpace.findAll({ where, include: [{ model: Lister, attributes: ['id','name','email'] }] });
    res.json(spaces);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch parking spaces', details: e.message }); }
});

// Create parking space (lister)
router.post('/parking-spaces', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'lister') return res.status(403).json({ error: 'Only listers can create parking spaces' });
    const { name, location, pricePerHour, capacity, description } = req.body;
    if (!name || !location || !pricePerHour) return res.status(400).json({ error: 'Missing required fields' });
    const space = await ParkingSpace.create({ name, location, pricePerHour, capacity, description, listerId: req.user.id });
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

module.exports = router;
