// routers/productRoutes.js
const express = require('express');
const multer = require('multer');
const { addProduct,getProducts,removeProduct,updateProduct,singleProduct } = require('../controllers/productController'); // Import the controller function

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Save images in the 'uploads' folder
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname), // Set unique filename
});
const upload = multer({ storage });

// POST route to add a product
router.post('/add-product', upload.single('image'), addProduct);
router.get('/products', getProducts);
router.post('/remove',removeProduct);

router.get('/product/:id' , singleProduct);
// PUT route to update a product
router.put('/products/:id', upload.single('image'), updateProduct); // Use PUT method for updates

module.exports = router;
