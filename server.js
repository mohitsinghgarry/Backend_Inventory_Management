const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./database/db');
const userRoutes = require('./routers/userRoutes');
const productRoutes = require('./routers/productRoutes'); // Import product routes
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve images from the uploads folder

// Connect to MongoDB
connectDB();

// Use Routers
app.use('/user', userRoutes);
app.use('/admin', productRoutes); // Add product routes for admin portal
app.use('/', productRoutes);


// Sample API route for frontend
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
