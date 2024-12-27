const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'unlockedgamedev@gmail.com',
        pass: 'Imthedev01', // Replace with the actual password or app-specific password
    },
});

// In-memory storage for verification codes
const verificationCodes = {};

// Endpoint to send login code
app.post('/send-code', (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).send('Username and email are required.');
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Store the code with a 5-minute expiration
    verificationCodes[username] = { code, expires: Date.now() + 5 * 60 * 1000 };

    // Send email
    const mailOptions = {
        from: 'unlockedgamedev@gmail.com',
        to: email,
        subject: 'Login Code',
        text: `Your login code is ${code}. This code is only valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Failed to send email.');
        }
        res.send('Code sent successfully.');
    });
});

// Endpoint to verify login code
app.post('/verify-code', (req, res) => {
    const { username, code } = req.body;
    const userCode = verificationCodes[username];

    if (!userCode) {
        return res.status(400).send('No code found for this user.');
    }

    if (Date.now() > userCode.expires) {
        return res.status(400).send('Code has expired.');
    }

    if (userCode.code.toString() === code) {
        delete verificationCodes[username]; // Code can only be used once
        res.send('Code verified successfully.');
    } else {
        res.status(400).send('Invalid code.');
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
