const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log(token)
    if (!token) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Use your JWT_SECRET
        req.user = decoded;  // Set user info to req.user
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateUser;
