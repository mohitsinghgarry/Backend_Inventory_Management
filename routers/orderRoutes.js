const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateUser = require('../middleware/authenticateUser');
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    requestCancelOrder,
    handleCancelApproval,
    getalladminorders
} = require('../controllers/orderController');
const router = express.Router();

// Route to place a new order
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
router.post('/order', authenticateUser, createOrder);
// Route to get all orders (with authentication)
router.get('/getorders', authenticateUser, getAllOrders); // Get all orders for authenticated user

// Route to get a specific order by ID
router.get('/:id', getOrderById); // Get a specific order by ID

// Route to update the order status (usually for admins or authorized users)
router.patch('/order/:id', authenticateUser, updateOrderStatus); // Update order status (with auth)

router.delete('/:id', authenticateUser, deleteOrder); // Delete an order (only for authorized users)

// New endpoints for order cancellation (authentication should be enforced)
router.post('/orders/:id/request-cancel', authenticateUser, requestCancelOrder); // User requests cancellation
router.post('/orders/:id/handle-cancel',authenticateUser, handleCancelApproval); // Admin handles cancellation approval

router.get('/getorders/all', authenticateUser , getalladminorders);
module.exports = router;