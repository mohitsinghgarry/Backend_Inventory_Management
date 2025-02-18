const mongoose = require('mongoose');

// Define the Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    name: { type: String, required: true },
    price: { type: Number, required: true },
    orderQuantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
    productId: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    date: { type: String, required: true },
    status: { type: String, default: 'Order Placed' },
});

// Create the Model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
