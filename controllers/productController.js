// controllers/productController.js
const Product = require('../models/ProductSchema'); // Import the Product model

// Controller function to add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, productId, price, category, quantity, description } = req.body;

        // Create an array of image URLs from the uploaded files
        const imageUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);

        // Create a new product document with multiple images
        const newProduct = new Product({
            name,
            productId,
            price,
            category,
            quantity,
            description,
            imageUrls, // Store the array of image URLs
        });

        // Save the new product to the database
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
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
//controller for finding singleProduct
exports.singleProduct = async (req, res) => {
    const { id } = req.params; // Extract product ID from URL params
    console.log(id);
    try {
        const product = await Product.findById(id); // Find the product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product); // Send the product data as JSON
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Controller function to remove a product
exports.removeProduct = async (req, res) => {
    const { id } = req.body; // Extract product ID from the request body
    try {
        const deletedProduct = await Product.findByIdAndDelete(id); // Delete the product from the database
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

// Controller function to update a product
exports.updateProduct = async (req, res) => {
    const { name, productId, price, category, quantity, description} = req.body;
    const imageUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, // Use the ID from the URL
            { name, productId, price, category, quantity,description ,imageUrls },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};
