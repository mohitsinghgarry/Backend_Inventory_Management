const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {
    addProduct,
    getProducts,
    removeProduct,
    updateProduct,
    singleProduct,
    newsingleProduct,
    updateStock,
} = require('../controllers/productController');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, // Replace with your Cloudinary cloud name
    api_key: process.env.API_CLOUD_KEY, // Replace with your Cloudinary API key
    api_secret: process.env.API_CLOUD_SECRET, // Replace with your Cloudinary API secret
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
    },
});

const upload = multer({ storage });

// Define routes
router.post('/add-product', upload.array('images', 4), addProduct);
router.get('/products', getProducts);
router.post('/remove', removeProduct);
router.get('/product/:id', singleProduct);
router.get('/newproduct/:id', newsingleProduct);
router.put('/products/:id', upload.array('images', 4), updateProduct);
router.patch('/products/:id/update-stock', updateStock);

module.exports = router;
