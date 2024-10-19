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
            pass: process.env.PASS, // Replace with your email password
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
        console.log('OTP sent to email:', email);
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

// Signup Controller with encrypted password storage
async function signup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.send('All fields are required!');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.send('User already exists!');
    }

    // Verify email
    const emailIsValid = await verifyEmail(email);
    if (!emailIsValid) {
        return res.send('Invalid email or email does not exist!');
    }

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 70000; // 60 seconds + 10 seconds grace period

    // Encrypt the password before storing it
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Store OTP, encrypted password, and expiration time
    otps[email] = { otp, otpExpiry, encryptedPassword };

    await sendOTP(email, otp);

    res.send('OTP has been sent to your email. Please verify to complete registration.');
}


// OTP Verification Controller
async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (otps[email]) {
        const currentTime = Date.now();
        if (otps[email].otp === otp && currentTime <= otps[email].otpExpiry) {
            // Retrieve the encrypted password from the `otps` object
            const encryptedPassword = otps[email].encryptedPassword;

            // Create a new user with the encrypted password
            const newUser = new User({ email, name: req.body.name, password: encryptedPassword });
            await newUser.save();
            delete otps[email]; // OTP verified, remove it
            res.send('OTP verified, signup successful!');
        } else if (currentTime > otps[email].otpExpiry) {
            delete otps[email]; // OTP expired, remove it
            res.send('OTP has expired. Please request a new one.');
        } else {
            res.send('Invalid OTP.');
        }
    } else {
        res.send('Invalid OTP or OTP has expired.');
    }
}


module.exports = { signup, verifyOtp };
