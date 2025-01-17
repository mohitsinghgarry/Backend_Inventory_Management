const User = require('../models/User');
const verifyEmail = require('../middleware/emailVerification');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// OTP store with encrypted passwords and timestamps
let otps = {};

// Function to generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Replace with your email
            pass: process.env.PASS,   // Use password from .env
        },
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for verification',
        text: `Your OTP for email verification is ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to email: ${email}`);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}

// Function to send password reset link via email
async function sendPasswordResetLink(email, token) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Replace with your email
            pass: process.env.PASS,   // Use password from .env
        },
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset Request',
        text: `To reset your password, click the link: https://frontend-inventory-managment.vercel.app/reset-password/${token}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset link sent to email: ${email}`);
    } catch (error) {
        console.error('Error sending password reset link:', error);
        throw new Error('Failed to send password reset link');
    }
}

// Signup Controller with encrypted password storage
async function signup(req, res) {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) { // Ensure userType is provided
        return res.status(400).json({ success: false, message: 'All fields are required!' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists!' });
        }

        // Verify email (check for valid email format and existence)
        const emailIsValid = await verifyEmail(email);
        if (!emailIsValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or email does not exist!' });
        }

        // Generate OTP and encrypt password
        const otp = generateOTP();
        const otpExpiry = Date.now() + 70000; // 70 seconds expiry for OTP
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Store OTP, encrypted password, and expiration time
        otps[email] = { otp, otpExpiry, encryptedPassword, name, userType };

        // Send OTP to user's email
        await sendOTP(email, otp);

        return res.status(200).json({ success: true, message: 'OTP has been sent to your email. Please verify to complete registration.' });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during signup. Please try again later.' });
    }
}

// OTP Verification Controller
async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required!' });
    }

    if (otps[email]) {
        const currentTime = Date.now();
        const storedOtpData = otps[email];

        if (storedOtpData.otp === otp && currentTime <= storedOtpData.otpExpiry) {
            try {
                // OTP is valid, create user with encrypted password, name, and userType
                const newUser = new User({
                    email,
                    name: storedOtpData.name,
                    userType: storedOtpData.userType,
                    password: storedOtpData.encryptedPassword,
                });
                await newUser.save();

                // OTP verified, remove it from store
                delete otps[email];

                return res.status(200).json({ success: true, message: 'OTP verified, signup successful!' });
            } catch (error) {
                console.error('Error saving user:', error);
                return res.status(500).json({ success: false, message: 'Error creating user. Please try again later.' });
            }
        } else if (currentTime > storedOtpData.otpExpiry) {
            // OTP has expired, remove it
            delete otps[email];
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
    } else {
        return res.status(400).json({ success: false, message: 'Invalid OTP or OTP has expired.' });
    }
}

// Login Controller
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required!' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }

        const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, {
            expiresIn: '1d', // Token expiry
        });

        // Successfully authenticated
        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.' });
    }
}

// Password Reset Request Controller
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required!' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // JWT for password reset
        await sendPasswordResetLink(email, token);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token and new password are required!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Change Password Controller
const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update User Profile Controller
const updateUserProfile = async (req, res) => {
    const { email } = req.body;
    const updates = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required!' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        Object.keys(updates).forEach((key) => {
            if (key !== 'email') {
                user[key] = updates[key];
            }
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profilePhoto: user.profilePhoto,
            },
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the profile.' });
    }
};

module.exports = {
    signup,
    verifyOtp,
    login,
    changePassword,
    requestPasswordReset,
    resetPassword,
    updateUserProfile,
};
