const Product = require('../models/ProductSchema'); // Import the Product model

// Controller function to add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, productId, price, category, quantity, description } = req.body;

        // Create an array of image URLs from Cloudinary uploads
        const imageUrls = req.files.map(file => file.path);

        const newProduct = new Product({
            name,
            productId,
            price,
            category,
            quantity,
            description,
            imageUrls, // Store Cloudinary URLs
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
};

// Controller function to get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Controller function to get a single product by MongoDB ID
exports.singleProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Controller function to get a single product by custom productId
exports.newsingleProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ productId: id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const isOutOfStock = product.quantity <= 0;

        res.status(200).json({
            productId: product.productId,
            name: product.name,
            availableQuantity: product.quantity,
            isOutOfStock,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Controller function to remove a product
exports.removeProduct = async (req, res) => {
    const { id } = req.body;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
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
    const { name, productId, price, category, quantity, description } = req.body;

    try {
        // Find the product by its ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Replace existing images with new ones if provided
        let imageUrls;
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path); // Replace with new Cloudinary URLs
        } else {
            imageUrls = product.imageUrls; // Retain existing images if no new ones are uploaded
        }

        // Update the product details
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, productId, price, category, quantity, description, imageUrls },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};


// Controller function to update stock
exports.updateStock = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        product.quantity -= quantity;

        if (product.quantity < 0) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }

        await product.save();
        res.status(200).json({ message: 'Stock updated successfully.', stock: product.quantity });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stock.', error: error.message });
    }
};
