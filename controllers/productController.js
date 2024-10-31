// controllers/productController.js
const Product = require('../models/ProductSchema'); // Import the Product model

// Controller function to add a new product
exports.addProduct = async (req, res) => {
    try {
        // Extract product details from the request body
        const { name, productId, price, category, quantity } = req.body;

        // Check if an image file was uploaded and set its path
        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : '';

        // Create a new product document
        const newProduct = new Product({
            name,
            productId,
            price,
            category,
            quantity,
            imageUrl,
        });

        // Save the new product to the database
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        // Handle errors, if any
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
};

// Controller function to get products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from the database
        res.status(200).json(products); // Send products as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};
