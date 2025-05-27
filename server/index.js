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

// Message status webhook
app.post('/message-status', (req, res) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;

  console.log('Message Status Update:', {
    messageSid,
    status: messageStatus,
    timestamp: new Date().toISOString()
  });

  res.sendStatus(200);
});

// Verify Twilio credentials on startup
console.log('Verifying Twilio configuration...');
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 8) + '...');
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Present' : 'Missing');
console.log('From Phone:', process.env.TWILIO_PHONE_NUMBER);

// Message status endpoint
app.get('/api/message-status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log('Checking status for message:', messageId);

    const message = await twilioClient.messages(messageId).fetch();
    console.log('Message status:', {
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    });

    res.json({
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated
    });
  } catch (error) {
    console.error('Error fetching message status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced SMS endpoint with improved error handling
app.post('/api/send-sms', async (req, res) => {
  console.log('\n--- New SMS Request ---');
  console.log('Time:', new Date().toISOString());
  console.log('Request body:', req.body);

  try {
    const { to, message } = req.body;

    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    // Check daily message limit
    const phoneNumber = to.startsWith('+') ? to : (to.length === 10 ? `+91${to}` : `+${to}`);
    if (messageTracker.counts[phoneNumber] >= messageTracker.MAX_DAILY_MESSAGES) {
      return res.status(429).json({
        success: false,
        error: 'Daily message limit reached',
        code: 'DAILY_LIMIT_EXCEEDED',
        details: `Maximum ${messageTracker.MAX_DAILY_MESSAGES} messages per day allowed`
      });
    }

    // Format the phone number if needed
    console.log('Sending message to:', phoneNumber);
    console.log('From:', process.env.TWILIO_PHONE_NUMBER);
    console.log('Message length:', message.length);

    // Send message
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      validateBeforeSend: true
    });

    // Update message count
    messageTracker.counts[phoneNumber] = (messageTracker.counts[phoneNumber] || 0) + 1;

    console.log('Message sent successfully!');
    console.log('Message details:', {
      sid: twilioMessage.sid,
      status: twilioMessage.status,
      direction: twilioMessage.direction,
      errorCode: twilioMessage.errorCode,
      errorMessage: twilioMessage.errorMessage
    });

    res.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      errorCode: twilioMessage.errorCode,
      errorMessage: twilioMessage.errorMessage,
      remainingMessages: messageTracker.MAX_DAILY_MESSAGES - messageTracker.counts[phoneNumber]
    });

  } catch (error) {
    console.error('Error in /api/send-sms:', error);
    
    // Check for specific Twilio error codes
    const twilioError = error.code ? error : (error.original || {});
    const statusCode = twilioError.code === 63038 ? 429 : 500; // Use 429 Too Many Requests for rate limiting
    
    const errorResponse = {
      success: false,
      error: error.message,
      code: twilioError.code,
      details: twilioError.moreInfo || twilioError.details
    };

    console.error('Error details:', errorResponse);
    res.status(statusCode).json(errorResponse);
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