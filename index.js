// index.js

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Referral form submission endpoint
app.post('/api/referral', async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    // Validate data
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save referral data to database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Send referral email
    await sendReferralEmail(referrerName, referrerEmail, refereeName, refereeEmail);

    res.status(201).json({ message: 'Referral submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send referral email
async function sendReferralEmail(referrerName, referrerEmail, refereeName, refereeEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: refereeEmail,
    subject: 'You have been referred!',
    text: `Dear ${refereeName},\n\n${referrerName} has referred you to our service.\n\nRegards,\nYour Company`,
  };

  await transporter.sendMail(mailOptions);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
