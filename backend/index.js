const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const Client = require('./models/client');
const Restaurant = require('./models/restaurant');

const JWT_SECRET = 'your_jwt_secret_key';

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  app.post('/api/auth/register', [
    body('email').isEmail(),
    body('name').notEmpty().withMessage('Username is required'),  // Added this
    body('password').isLength({ min: 6 }),
    body('userType').isIn(['client', 'restaurant'])
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

    const { email, password, userType, name } = req.body;
    const Model = userType === 'client' ? Client : Restaurant;
    
    const existingUser = await Model.findOne({ 
      $or: [{ email }, { name }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new Model({
      email,
      password: hashedPassword,
      name,
      ...(userType === 'restaurant' && { address: req.body.address })
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userType },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser._id,
      userType
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body); // Add this for debugging
    
    const { name, password, userType } = req.body;
    
    if (!name || !password || !userType) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        received: { name, password, userType } // Add this for debugging
      });
    }

    const Model = userType === 'client' ? Client : Restaurant;
    
    const user = await Model.findOne({ name });
    if (!user) {
      return res.status(401).json({ message: 'Username not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Password incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id, userType },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      userType
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});