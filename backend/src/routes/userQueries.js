/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { UserQuery, User } = require('../models');
const router = express.Router();

// Create user query
router.post('/user/queries', authenticateToken, async (req, res) => {
  try {
    const { subject, category, description, attachmentUrl } = req.body;
    if (!subject || !category || !description) return res.status(400).json({ error: 'Missing required fields' });
    const newQuery = await UserQuery.create({ subject, category, description, attachmentUrl, userId: req.user.id });
    res.status(201).json(newQuery);
  } catch (e) { res.status(500).json({ error: 'Failed to create query', details: e.message }); }
});

// List own queries with pagination/filter
router.get('/user/queries', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const status = req.query.status;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    const { count: total, rows } = await UserQuery.findAndCountAll({ where, order: [['createdAt','DESC']], limit, offset: (page-1)*limit });
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch queries', details: e.message }); }
});

// Admin list all queries
router.get('/admin/user-queries', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access' });
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 1), 200);
    const status = req.query.status;
    const search = req.query.search?.toLowerCase();
    const where = {};
    if (status) where.status = status;
    if (search) where[Sequelize.Op.or] = [
      { subject: { [Sequelize.Op.like]: `%${search}%` } },
      { description: { [Sequelize.Op.like]: `%${search}%` } }
    ];
    const { count: total, rows } = await UserQuery.findAndCountAll({ where, include: [{ model: User, attributes: ['id','fullName','email']}], order: [['createdAt','DESC']], limit, offset: (page-1)*limit });
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch queries', details: e.message }); }
});

// Admin update query
router.put('/admin/user-queries/:queryId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access' });
    const { status, adminResponse } = req.body;
    const allowedStatuses = ['pending','in-progress','resolved','closed'];
    if (status && !allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status value' });
    const query = await UserQuery.findByPk(req.params.queryId);
    if (!query) return res.status(404).json({ error: 'Query not found' });
    if ((status === 'resolved' || status === 'closed') && !(adminResponse || query.adminResponse)) return res.status(400).json({ error: 'Admin response required before resolving or closing' });
    await query.update({ status: status || query.status, adminResponse: adminResponse !== undefined ? adminResponse : query.adminResponse });
    res.json({ message: 'Query updated successfully', query });
  } catch (e) { res.status(500).json({ error: 'Failed to update query', details: e.message }); }
});

// Backward compatibility: /api/user/:userId/queries (self or admin)
router.get('/user/:userId/queries', authenticateToken, async (req, res) => {
  try {
    const paramUserId = parseInt(req.params.userId, 10);
    if (Number.isNaN(paramUserId)) return res.status(400).json({ error: 'Invalid user ID format' });
    if (req.user.id !== paramUserId && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized access' });
    const queries = await UserQuery.findAll({ where: { userId: paramUserId }, order: [['createdAt','DESC']] });
    res.json(queries);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch queries', details: e.message }); }
});

module.exports = router;
