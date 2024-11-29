// routers/userRoutes.js
const express = require('express');
const { signup, verifyOtp, login,requestPasswordReset, resetPassword, updateUserProfile } = require('../controllers/userController'); // Import changePassword

const router = express.Router();

// Signup route
router.post('/signup', signup);

// OTP verification route
router.post('/verify-otp', verifyOtp);

// Login route
router.post('/login', login);

// request for reset password
router.post('/request-password-reset',requestPasswordReset);

// Change password route
router.post('/reset-password', resetPassword); // Ensure this points to changePassword


router.put('/update-profile', updateUserProfile);

module.exports = router;
