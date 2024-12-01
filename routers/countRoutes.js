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

// Route to get the recent orders count
router.get("/orders/recent-count", async (req, res) => {
  try {
    const now = new Date(); // Current time in UTC

    console.log("Now (UTC):", now);

    // Retrieve all orders
    const orders = await Order.find();

    // Filter orders based on the parsed date
    const recentOrdersCount = orders.filter((order) => {
      console.log("Order Date String:", order.date);

      // Parse the order date
      const orderDate = new Date(order.date);
      if (isNaN(orderDate)) {
        console.error("Invalid order date:", order.date);
        return false;
      }

      console.log("Parsed Order Date (UTC):", orderDate);

      // Check if the order date matches the current date (ignoring time)
      return (
        orderDate.toISOString().split("T")[0] ===
        now.toISOString().split("T")[0]
      );
    }).length;

    console.log("Recent Orders Count:", recentOrdersCount);
    res.json({ count: recentOrdersCount });
  } catch (error) {
    console.error("Error fetching recent orders count:", error);
    res.status(500).json({ message: "Error fetching recent orders count" });
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
