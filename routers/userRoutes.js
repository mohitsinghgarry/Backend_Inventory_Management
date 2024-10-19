const express = require('express');
const { signup, verifyOtp } = require('../controllers/userController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// OTP verification route
router.post('/verify-otp', verifyOtp);

module.exports = router;
