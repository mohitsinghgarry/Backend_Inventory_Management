const Order = require('../models/OrderSchema');

// Controller to create a new order
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;  // Extract userId from the authenticated user
        const orderData = { ...req.body, userId };  // Attach the userId to the order data

        const newOrder = new Order(orderData);  // Create a new order
        const savedOrder = await newOrder.save();  // Save to the database

        res.status(201).json({ message: 'Order placed successfully', order: savedOrder });  // Respond with the saved order
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create the order. Please try again.' });
    }
};

// Controller to fetch all orders for a user
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from authenticated request
        console.log('Fetching orders for user:', userId);
        const orders = await Order.find({ userId }); // Fetch orders for the logged-in user
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders. Please try again.' });
    }
};


// Controller to get a specific order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const userId = req.user.id; // Get userId from authenticated user
        const order = await Order.findOne({ _id: id, userId }); // Ensure that the order belongs to the authenticated user

        if (!order) {
            return res.status(404).json({ error: 'Order not found or you do not have access to it' });
        }

        res.status(200).json(order);
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ error: 'Failed to fetch order details. Please try again.' });
    }
};

// Controller to update an order's status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const { status } = req.body; // Extract status from the request body
        const userId = req.user.id;  // Get userId from the authenticated user
        console.log(id+" " + status+" " + userId);
        // Ensure the order belongs to the authenticated user or the user is an admin
        const order = await Order.findOne({ _id: id });
        if (!order) {
            return res.status(404).json({ error: 'Order not found or you do not have permission to update it' });
        }

        order.status = status;  // Update the order's status
        const updatedOrder = await order.save();  // Save the updated order

        res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status. Please try again.' });
    }
};

// Controller to request order cancellation
const requestCancelOrder = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const userId = req.user.id; // Get userId from the authenticated user
        console
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, userId }, // Ensure the order belongs to the authenticated user
            { status: 'Cancellation Requested' }, // Set the order status to "Cancellation Requested"
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found or you do not have permission to cancel it' });
        }

        res.status(200).json({ message: 'Cancellation request submitted', updatedOrder });
    } catch (err) {
        console.error('Error requesting order cancellation:', err);
        res.status(500).json({ error: 'Failed to request cancellation. Please try again.' });
    }
};

// Controller for admin to approve or reject cancellation
const handleCancelApproval = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const { action } = req.body; // Extract admin action (approve/reject) from the request body
        console.log(req.body)
        let updatedOrder;
        if (action === 'approve') {
            updatedOrder = await Order.findByIdAndUpdate(
                id,
                { status: 'Canceled' }, // Approve cancellation by setting status to "Canceled"
                { new: true } // Return the updated document
            );
        } else if (action === 'reject') {
            updatedOrder = await Order.findByIdAndUpdate(
                id,
                { status: 'Order Placed' }, // Reject cancellation by resetting status
                { new: true }
            );
        } else {
            return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
        }

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: `Order cancellation ${action}ed successfully`, updatedOrder });
    } catch (err) {
        console.error('Error handling cancellation approval:', err);
        res.status(500).json({ error: 'Failed to handle cancellation approval. Please try again.' });
    }
};

const getalladminorders = async (req, res) => {
    try {
        // Ensure `req.user` exists and contains necessary data
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Admins only' });
        }

        // Fetch all orders
        const orders = await Order.find();

        // If no orders found, send an appropriate response
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // Send the orders in response
        res.status(200).json(orders);
    } catch (error) {
        // Log the error for debugging
        console.error('Error fetching orders:', error.message);

        // Return a generic server error message
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Controller to delete an order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const userId = req.user.id; // Get userId from the authenticated user

        const deletedOrder = await Order.findOneAndDelete({ _id: id});
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found or you do not have permission to delete it' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order. Please try again.' });
    }
};

// Export all controllers
module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    requestCancelOrder, // Export the request cancellation controller
    handleCancelApproval, // Export the admin approval/rejection controller
    deleteOrder,
    getalladminorders,
};
