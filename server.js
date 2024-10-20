const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./database/db');
const userRoutes = require('./routers/userRoutes');
const cors = require('cors'); // Added CORS middleware
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// Use Routers
app.use('/user', userRoutes);

// Sample API route for frontend
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
