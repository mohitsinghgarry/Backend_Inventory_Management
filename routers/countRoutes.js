const express = require('express');
const Product = require('../models/ProductSchema');
const Order = require('../models/OrderSchema');
const User = require('../models/User');
const moment = require('moment');  // Add moment import
const router = express.Router();


const parseIndianDate = (dateString) => {
  try {
    // Split date and time
    const [datePart, timePart] = dateString.split(', '); // '12/1/2024, 11:03:42 AM'
    const [day, month, year] = datePart.split('/').map(Number); // [12, 1, 2024]
    const [time, meridian] = timePart.split(' '); // '11:03:42 AM' -> ['11:03:42', 'AM']
    const [hours, minutes, seconds] = time.split(':').map(Number); // '11:03:42' -> [11, 3, 42]

    // Adjust hours for AM/PM format
    const adjustedHours =
      meridian === 'PM' && hours !== 12
        ? hours + 12
        : meridian === 'AM' && hours === 12
          ? 0
          : hours;

    // Create and return the Date object
    return new Date(year, day - 1, month, adjustedHours, minutes, seconds);
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null; // Return null if parsing fails
  }
};

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

// Route to get the recent orders count
router.get('/orders/recent-count', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Midnight today
    const now = new Date(); // Current time
    console.log(now)
    const orders = await Order.find(); // Retrieve all orders
    const recentOrdersCount = orders.filter(order => {
      console.log(order.date);
      const orderDate = parseIndianDate(order.date); // Parse the stored date string
      console.log(orderDate)
      return orderDate >= startOfDay && orderDate <= now;
    }).length;

    res.json({ count: recentOrdersCount });
  } catch (error) {
    console.error('Error fetching recent orders count:', error);
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
