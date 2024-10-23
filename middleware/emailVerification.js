const axios = require('axios');
require('dotenv').config();

const emailVerificationApiKey = process.env.API_VARI;

async function verifyEmail(email) {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${emailVerificationApiKey}&email=${email}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        // Check if email is valid and deliverable
        return data.is_valid_format.value && data.deliverability === 'DELIVERABLE';
    } catch (error) {
        console.error('Error verifying email:', error);
        return false;
    }
}

module.exports = verifyEmail;
