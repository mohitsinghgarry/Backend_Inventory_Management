const express = require('express');
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    requestCancelOrder, // Import request cancellation controller
    handleCancelApproval, // Import admin approval/rejection controller
} = require('../controllers/orderController');

const router = express.Router();

// Routes
router.post('/order', createOrder); // Create a new order
router.get('/getorders', getAllOrders); // Get all orders
router.get('/:id', getOrderById); // Get a specific order by ID
router.patch('/order/:id', updateOrderStatus); // Update order status
router.delete('/:id', deleteOrder); // Delete an order

// New endpoints for order cancellation
router.post('/orders/:id/request-cancel', requestCancelOrder); // User requests cancellation
router.post('/orders/:id/handle-cancel', handleCancelApproval); // Admin approves/rejects cancellation

 // Direct cancel (if needed for admin use)

module.exports = router;
