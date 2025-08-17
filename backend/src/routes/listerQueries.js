/* eslint-env node */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { ListerQuery, Lister } = require('../models');
const router = express.Router();

// Create lister query
router.post('/lister/queries', authenticateToken, async (req, res) => {
  try {
    const { subject, category, description, attachmentUrl } = req.body;
    if (!subject || !category || !description) return res.status(400).json({ error: 'Missing required fields' });
    const newQuery = await ListerQuery.create({ subject, category, description, attachmentUrl, listerId: req.user.id });
    res.status(201).json(newQuery);
  } catch (e) { res.status(500).json({ error: 'Failed to create query', details: e.message }); }
});

// List own lister queries
router.get('/lister/:listerId/queries', authenticateToken, async (req, res) => {
  try {
    const listerId = parseInt(req.params.listerId, 10);
    if (Number.isNaN(listerId)) return res.status(400).json({ error: 'Invalid lister ID' });
    if (req.user.id !== listerId && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access' });
    const queries = await ListerQuery.findAll({ where: { listerId }, order: [['createdAt','DESC']] });
    res.json(queries);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch queries', details: e.message }); }
});

// Admin list all lister queries
router.get('/admin/queries', authenticateToken, async (req, res) => {
  try {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const queries = await ListerQuery.findAll({ order: [['createdAt','DESC']], include: [{ model: Lister, attributes: ['id','fullName','businessName','email','phone'] }] });
    res.json(queries);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch queries', details: e.message }); }
});

// Admin update lister query
router.put('/admin/queries/:queryId', authenticateToken, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const query = await ListerQuery.findByPk(req.params.queryId);
    if (!query) return res.status(404).json({ error: 'Query not found' });
    await query.update({ status: status || query.status, adminResponse: adminResponse !== undefined ? adminResponse : query.adminResponse });
    res.json({ message: 'Query updated successfully', query });
  } catch (e) { res.status(500).json({ error: 'Failed to update query', details: e.message }); }
});

module.exports = router;
