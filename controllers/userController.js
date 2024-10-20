const bcrypt = require('bcrypt');
const User = require('../models/User');
const verifyEmail = require('../middleware/emailVerification');
const nodemailer = require('nodemailer');

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
            user: 'mohitsinghx4@gmail.com', // Replace with your email
            pass: process.env.PASS,         // Replace with your email password from .env
        },
    });

    let mailOptions = {
        from: 'mohitsinghx4@gmail.com',
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

// Signup Controller with encrypted password storage
async function signup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Verify email (check for valid email format and existence)
        const emailIsValid = await verifyEmail(email);
        if (!emailIsValid) {
            return res.status(400).json({ message: 'Invalid email or email does not exist!' });
        }

        // Generate OTP and encrypt password
        const otp = generateOTP();
        const otpExpiry = Date.now() + 70000; // 60 seconds + 10 seconds grace period
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Store OTP, encrypted password, and expiration time
        otps[email] = { otp, otpExpiry, encryptedPassword };

        // Send OTP to user's email
        await sendOTP(email, otp);

        return res.status(200).json({ message: 'OTP has been sent to your email. Please verify to complete registration.' });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'An error occurred during signup. Please try again later.' });
    }
}

// OTP Verification Controller
async function verifyOtp(req, res) {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required!' });
    }

    if (otps[email]) {
        const currentTime = Date.now();
        const storedOtpData = otps[email];

        if (storedOtpData.otp === otp && currentTime <= storedOtpData.otpExpiry) {
            try {
                // OTP is valid, create user with encrypted password
                const newUser = new User({
                    email,
                    name,
                    password: storedOtpData.encryptedPassword,
                });
                await newUser.save();
                
                // OTP verified, remove it from store
                delete otps[email];

                return res.status(200).json({ message: 'OTP verified, signup successful!' });
            } catch (error) {
                console.error('Error saving user:', error);
                return res.status(500).json({ message: 'Error creating user. Please try again later.' });
            }
        } else if (currentTime > storedOtpData.otpExpiry) {
            // OTP has expired, remove it
            delete otps[email];
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        } else {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
    } else {
        return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
    }
}

module.exports = { signup, verifyOtp };
