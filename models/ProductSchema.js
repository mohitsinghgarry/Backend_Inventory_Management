const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productId: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrls: [{ type: String }] // Change to an array for multiple image URLs
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
