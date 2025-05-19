import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import Stripe from 'stripe';
import User from './models/User.js';

dotenv.config();

const app = express();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use a stable Stripe API version
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User(req.body);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ token, user: { 
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      thingspeakChannel: user.thingspeakChannel
    }});
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({ token, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      thingspeakChannel: user.thingspeakChannel
    }});
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Track message counts per number
const messageTracker = {
  counts: {},
  lastReset: new Date().toDateString(),
  MAX_DAILY_MESSAGES: 8 // Keep one message below Twilio trial limit
};

// Reset message counts at midnight
setInterval(() => {
  const today = new Date().toDateString();
  if (today !== messageTracker.lastReset) {
    messageTracker.counts = {};
    messageTracker.lastReset = today;
  }
}, 60000); // Check every minute

// SMS Alert Endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    // Reset counts if it's a new day
    const today = new Date().toDateString();
    if (today !== messageTracker.lastReset) {
      messageTracker.counts = {};
      messageTracker.lastReset = today;
    }

    // Check message count for this number
    messageTracker.counts[to] = messageTracker.counts[to] || 0;
    if (messageTracker.counts[to] >= messageTracker.MAX_DAILY_MESSAGES) {
      return res.status(429).json({
        success: false,
        error: 'Daily message limit reached',
        remainingMessages: 0,
        retryAfter: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      });
    }

    // Send message
    await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // Update count on success
    messageTracker.counts[to]++;

    res.json({
      success: true,
      remainingMessages: messageTracker.MAX_DAILY_MESSAGES - messageTracker.counts[to]
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ message: 'Error sending SMS', error: error.message });
  }
});

// Stripe payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Received payment intent request:', req.body);
  try {
    const { amount, currency, description } = req.body;
    console.log('Creating payment intent with amount:', amount, 'currency:', currency);
    if (!amount || !currency) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: description || 'Premium subscription',
      payment_method_types: ['card'],
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({
      error: err.message || 'Failed to create payment intent',
      stack: err.stack || null,
      stripeError: err.raw?.message || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));