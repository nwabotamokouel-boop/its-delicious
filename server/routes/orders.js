const router = require('express').Router();
const Order = require('../models/Order');

// Place an order (API - called from frontend JS)
router.post('/', async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      userId: req.session.user ? req.session.user._id : null
    });
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// View my orders (requires login)
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const orders = await Order.find({ userId: req.session.user._id }).sort({ createdAt: -1 });
  res.render('orders', { orders, user: req.session.user });
});

module.exports = router;
