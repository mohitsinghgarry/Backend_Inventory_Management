const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    requestCancelOrder,
    handleCancelApproval,
} = require('../controllers/orderController'); // Ensure the controller is imported
const router = express.Router();

router.post('/placeorder', [
    // Validate and sanitize inputs
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('orderQuantity').isInt({ gt: 0 }).withMessage('Order quantity must be a positive integer'),
    body('totalPrice').isNumeric().withMessage('Total price must be a number'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.postalCode').notEmpty().withMessage('Postal code is required'),
    body('address.country').notEmpty().withMessage('Country is required'),
    body('phoneNumber').notEmpty().isMobilePhone().withMessage('Valid phone number is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Delegate to controller to handle order creation
    await createOrder(req, res);
});

// Other routes
router.post('/order', createOrder); // Create a new order
router.get('/getorders', getAllOrders); // Get all orders
router.get('/:id', getOrderById); // Get a specific order by ID
router.patch('/order/:id', updateOrderStatus); // Update order status
router.delete('/:id', deleteOrder); // Delete an order

// New endpoints for order cancellation
router.post('/orders/:id/request-cancel', requestCancelOrder); // User requests cancellation
router.post('/orders/:id/handle-cancel', handleCancelApproval); // Admin approves/rejects cancellation

module.exports = router;
