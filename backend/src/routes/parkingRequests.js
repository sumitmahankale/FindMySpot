/* eslint-env node */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { ParkingRequest, Lister, ParkingSpace } = require('../models');
const router = express.Router();

// Create parking request (lister)
router.post('/parking-requests', authenticateToken, async (req, res) => {
  try {
    const data = { ...req.body, listerId: req.user.id };
    const created = await ParkingRequest.create(data);
    res.status(201).json(created);
  } catch (e) { res.status(400).json({ error: 'Failed to create parking request', details: e.message }); }
});

// List pending requests (admin placeholder)
router.get('/parking-requests', authenticateToken, async (req, res) => {
  try {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const requests = await ParkingRequest.findAll({ where: { status: 'pending' }, order: [['createdAt','DESC']], include: [{ model: Lister, attributes: ['id','email','fullName','businessName','phone'] }] });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch parking requests', details: e.message }); }
});

// List requests for a lister
router.get('/lister/:listerId/parking-requests', authenticateToken, async (req, res) => {
  try {
    const listerId = parseInt(req.params.listerId, 10);
    if (Number.isNaN(listerId)) return res.status(400).json({ error: 'Invalid lister ID' });
    if (req.user.id !== listerId && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access to lister parking requests' });
    const requests = await ParkingRequest.findAll({ where: { listerId }, order: [['createdAt','DESC']] });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch lister parking requests', details: e.message }); }
});

// Approve request (admin placeholder)
router.put('/parking-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const request = await ParkingRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    await request.update({ status: 'approved' });
    await ParkingSpace.create({ name: request.listerName, contact: request.contact, location: request.location, price: request.price, availability: request.availability, description: request.description, lat: request.lat, lng: request.lng, isActive: true, listerId: request.listerId });
    res.json({ message: 'Parking request approved and space created successfully' });
  } catch (e) { res.status(500).json({ error: 'Failed to approve request', details: e.message }); }
});

// Reject request
router.put('/parking-requests/:id/reject', authenticateToken, async (req, res) => {
  try {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const request = await ParkingRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    await request.update({ status: 'rejected' });
    res.json({ message: 'Parking request rejected successfully' });
  } catch (e) { res.status(500).json({ error: 'Failed to reject request', details: e.message }); }
});

module.exports = router;
