/* eslint-env node */
const express = require('express');
const { Lister, ParkingSpace } = require('../models');
const router = express.Router();

// Public lister profile endpoint
router.get('/listers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid lister id' });
    const lister = await Lister.findByPk(id, { attributes: ['id','fullName','businessName','email','phone','address','createdAt'] });
    if (!lister) return res.status(404).json({ error: 'Lister not found' });
    const activeListings = await ParkingSpace.count({ where: { listerId: id, isActive: true } });
    res.json({ ...lister.toJSON(), activeListings });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch lister', details: e.message }); }
});

module.exports = router;
