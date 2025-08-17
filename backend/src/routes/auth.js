/* eslint-env node */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Lister } = require('../models');
const router = express.Router();

// User register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ error: 'Missing required fields' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User with this email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, fullName, password: hashed });
  const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, process.env.JWT_SECRET || 'insecure-dev-secret', { expiresIn: '7d' });
  res.status(201).json({ token, username: user.email, fullName: user.fullName, role: 'user' });
  } catch (e) { res.status(400).json({ error: 'Failed to register user', details: e.message }); }
});

// User login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, process.env.JWT_SECRET || 'insecure-dev-secret', { expiresIn: '7d' });
  res.json({ token, username: user.email, fullName: user.fullName, role: 'user' });
  } catch (e) { res.status(500).json({ error: 'Failed to log in', details: e.message }); }
});

// Lister register
router.post('/auth/lister/register', async (req, res) => {
  try {
    const { email, password, fullName, businessName, phone, address } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ error: 'Missing required fields' });
    const existing = await Lister.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Lister with this email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const lister = await Lister.create({ email, fullName, businessName, phone, address, password: hashed });
    const token = jwt.sign({ id: lister.id, email: lister.email, role: 'lister' }, process.env.JWT_SECRET || 'insecure-dev-secret', { expiresIn: '7d' });
    res.status(201).json({ token, username: lister.email, fullName: lister.fullName, businessName: lister.businessName, listerId: lister.id, role: 'lister' });
  } catch (e) { res.status(400).json({ error: 'Failed to register lister', details: e.message }); }
});

// Lister login
router.post('/auth/lister/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const lister = await Lister.findOne({ where: { email } });
    if (!lister) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, lister.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: lister.id, email: lister.email, role: 'lister' }, process.env.JWT_SECRET || 'insecure-dev-secret', { expiresIn: '7d' });
    res.json({ token, username: lister.email, fullName: lister.fullName, businessName: lister.businessName, listerId: lister.id, role: 'lister' });
  } catch (e) { res.status(500).json({ error: 'Failed to log in', details: e.message }); }
});

module.exports = router;
