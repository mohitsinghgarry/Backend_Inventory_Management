const Order = require('../models/OrderSchema');

// Controller to create a new order
const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body); // Create a new order document
        const savedOrder = await newOrder.save(); // Save to the database
        res.status(201).json(savedOrder); // Respond with the saved order
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create the order' });
    }
};

// Controller to fetch all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find(); // Retrieve all orders
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Controller to get a specific order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const order = await Order.findById(id); // Find order by ID
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// Controller to update an order's status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const { status } = req.body; // Extract status from the request body
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// Controller to request order cancellation
const requestCancelOrder = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: 'Cancellation Requested' }, // Set the order status to "Cancellation Requested"
            { new: true } // Return the updated document
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Cancellation request submitted', updatedOrder });
    } catch (err) {
        console.error('Error requesting order cancellation:', err);
        res.status(500).json({ error: 'Failed to request order cancellation' });
    }
};

// Controller for admin to approve or reject cancellation
const handleCancelApproval = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const { action } = req.body; // Extract admin action (approve/reject) from the request body

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
        res.status(500).json({ error: 'Failed to handle cancellation approval' });
    }
};

// Controller to delete an order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from route parameters
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
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
};
