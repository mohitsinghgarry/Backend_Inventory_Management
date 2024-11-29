const express = require('express');
const Product = require('../models/ProductSchema');
const Order = require('../models/OrderSchema');
const User = require('../models/User');
const moment = require('moment');  // Add moment import
const router = express.Router();

// Route to get product count
router.get('/products/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json({ count: productCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product count', error: err.message });
  }
});

// Example of counting recent orders from today (midnight to now)
router.get('/orders/recent-count', async (req, res) => {  // Change app.get to router.get
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); // Midnight today
  
      const now = new Date(); // Current time
  
      const recentOrdersCount = await Order.countDocuments({
        date: { $gte: startOfDay, $lte: now }, // Orders created today
      });
  
      res.json({ count: recentOrdersCount });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching recent orders count' });
    }
});

// Route to get total order count
router.get('/orders/count', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    res.json({ count: orderCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order count', error: err.message });
  }
});

// Route to get total customer count (distinct emails)
router.get('/users/count', async (req, res) => {
  try {
    // Get distinct emails, excluding null, empty, or invalid emails
    const customerEmails = await User.distinct('email', { email: { $ne: null, $ne: "" } });

    // Count the length of the array of distinct emails
    const customerCount = customerEmails.length;

    res.json({ totalCustomers: customerCount });
  } catch (err) {
    console.error("Error fetching customer count:", err);
    res.status(500).send('Server Error');
  }
});

// Route to get low-stock product count
router.get('/products/low-stock', async (req, res) => {
  const lowStockThreshold = 5; // Threshold for low stock
  try {
    const lowStockProducts = await Product.find({ quantity: { $lt: lowStockThreshold } });
    res.json({ count: lowStockProducts.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low-stock products', error: err.message });
  }
});

module.exports = router;
