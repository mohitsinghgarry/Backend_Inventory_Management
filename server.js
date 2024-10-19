const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./database/db');
const userRoutes = require('./routers/userRoutes');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// Use Routers
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
