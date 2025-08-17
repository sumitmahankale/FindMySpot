/* eslint-env node */
const express = require('express');
const { Sequelize } = require('sequelize');
const { User, Lister, ParkingSpace, Booking } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/admin/dashboard', /*authenticateToken,*/ async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, totalListers, newUsersThisMonth, newListersThisMonth, totalParkingSpaces, activeListings, totalBookings, pendingBookings, bookingsThisMonth] = await Promise.all([
      User.count(),
      Lister.count(),
      User.count({ where: { createdAt: { [Sequelize.Op.gte]: firstDayOfMonth } } }),
      Lister.count({ where: { createdAt: { [Sequelize.Op.gte]: firstDayOfMonth } } }),
      ParkingSpace.count(),
      ParkingSpace.count({ where: { isActive: true } }),
      Booking.count(),
      Booking.count({ where: { status: 'pending' } }),
      Booking.count({ where: { createdAt: { [Sequelize.Op.gte]: firstDayOfMonth } } })
    ]);

    const revenueResult = await Booking.findOne({ attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']], where: { createdAt: { [Sequelize.Op.gte]: firstDayOfMonth }, status: { [Sequelize.Op.in]: ['confirmed','completed'] } }, raw: true });
    const revenueThisMonth = revenueResult?.total ? parseFloat(revenueResult.total) : 0;

    const userGrowth = [];
    for (let i = 4; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      userGrowth.push({
        month: month.toLocaleString('default', { month: 'short' }),
        users: await User.count({ where: { createdAt: { [Sequelize.Op.lt]: monthEnd } } }),
        listers: await Lister.count({ where: { createdAt: { [Sequelize.Op.lt]: monthEnd } } })
      });
    }

    const bookingTrends = [];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i); date.setHours(0,0,0,0);
      const nextDay = new Date(date); nextDay.setDate(date.getDate() + 1);
      const dayBookings = await Booking.count({ where: { createdAt: { [Sequelize.Op.gte]: date, [Sequelize.Op.lt]: nextDay } } });
      bookingTrends.push({ day: dayNames[date.getDay()], bookings: dayBookings });
    }

    res.json({ users: totalUsers, listers: totalListers, parkingSpaces: totalParkingSpaces, activeListings, totalBookings, pendingBookings, newUsersThisMonth, newListersThisMonth, bookingsThisMonth, revenueThisMonth, userGrowth, bookingTrends });
  } catch (e) { res.status(500).json({ error: 'Failed to retrieve dashboard statistics', details: e.message }); }
});

// Recent resources
router.get('/admin/recent-bookings', async (req, res) => {
  try {
    const recentBookings = await Booking.findAll({ include: [{ model: User, attributes: ['id','fullName','email'] }, { model: ParkingSpace, attributes: ['id','location','price'] }, { model: Lister, attributes: ['id','fullName','businessName'] }], order: [['createdAt','DESC']], limit: 10 });
    res.json(recentBookings);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch recent bookings', details: e.message }); }
});
router.get('/admin/recent-users', async (req, res) => {
  try { res.json(await User.findAll({ attributes: ['id','fullName','email','createdAt'], order: [['createdAt','DESC']], limit: 10 })); }
  catch (e) { res.status(500).json({ error: 'Failed to fetch recent users', details: e.message }); }
});
router.get('/admin/recent-listers', async (req, res) => {
  try { res.json(await Lister.findAll({ attributes: ['id','fullName','email','businessName','createdAt'], order: [['createdAt','DESC']], limit: 10 })); }
  catch (e) { res.status(500).json({ error: 'Failed to fetch recent listers', details: e.message }); }
});
router.get('/admin/recent-spaces', async (req, res) => {
  try { res.json(await ParkingSpace.findAll({ include: [{ model: Lister, attributes: ['id','fullName','businessName'] }], order: [['createdAt','DESC']], limit: 10 })); }
  catch (e) { res.status(500).json({ error: 'Failed to fetch recent parking spaces', details: e.message }); }
});

module.exports = router;
