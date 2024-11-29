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
// Assuming your schema for Product has a 'stock' field
const getLowStockProducts = async (req, res) => {
    try {
      // Find products with stock <= 0
      const lowStockProducts = await Product.find({ stock: { $lte: 0 } });
  
      res.json({
        count: lowStockProducts.length,
        lowStockProducts: lowStockProducts, // Optional, you can return the products themselves
      });
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: error.message });
    }
  };
  

exports.newsingleProduct = async (req, res) => {
    const { id } = req.params; // Extract productId from URL params

    try {
        // Find the product by the custom field 'productId'
        const product = await Product.findOne({ productId: id });
        console.log(product)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product is in stock
        const isOutOfStock = product.quantity <= 0;
            console.log(isOutOfStock)
        // Send the product data including stock status
        res.status(200).json({
            productId: product.productId,
            name: product.name,
            availableQuantity: product.availableQuantity,
            isOutOfStock,
        });
    } catch (error) {
        // Handle errors if any occur
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
    const { name, productId, price, category, quantity, description, existingImages } = req.body;

    try {
        // Fetch the current product to get existing image URLs
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Combine existing images and new uploaded images
        let imageUrls = existingImages ? JSON.parse(existingImages) : product.imageUrls;

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        // Update the product with new data
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, productId, price, category, quantity, description, imageUrls },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.updateStock = async (req, res) => {
    const { productId } = req.body; // This is the custom productId, not the MongoDB _id field
    const { quantity } = req.body;



    try {
        // Find the product using the `productId` field
        const product = await Product.findOne({ productId }); // Query by custom productId
        console.log(product)
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Deduct the quantity from stock
        product.quantity -= quantity;

        if (product.quantity < 0) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }

        await product.save();
        res.status(200).json({ message: 'Stock updated successfully.', stock: product.quantity });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
