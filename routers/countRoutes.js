const express = require('express');
const Product = require('../models/ProductSchema');
const Order = require('../models/OrderSchema');
const User = require('../models/User');
const moment = require('moment');  // Add moment import
const router = express.Router();
const parseIndianDate = (dateString) => {
  try {
    const [datePart, timePart] = dateString.split(", ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [time, meridian] = timePart.split(" ");
    const [hours, minutes, seconds] = time.split(":").map(Number);

    const adjustedHours =
      meridian === "PM" && hours !== 12
        ? hours + 12
        : meridian === "AM" && hours === 12
        ? 0
        : hours;

    const date = new Date(year, month - 1, day, adjustedHours, minutes, seconds);
    return date.toISOString();
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null;
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
router.get("/orders/recent-count", async (req, res) => {
  try {
    // Define the start of the day and the current time in UTC
    const now = new Date(); // Current time in UTC
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0); // Midnight UTC of the same day

    console.log("Start of Day (UTC):", startOfDay);
    console.log("Now (UTC):", now);

    // Retrieve all orders
    const orders = await Order.find(); 

    // Filter orders based on the parsed date
    const recentOrdersCount = orders.filter((order) => {
      console.log("Order Date String:", order.date);

      // Parse the stored date string into UTC
      const orderDate = new Date(order.date); // Assuming the stored date is ISO 8601
      console.log("Parsed Order Date (UTC):", orderDate);

      // Check if the order date falls within today
      return orderDate >= startOfDay && orderDate <= now;
    }).length;

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
