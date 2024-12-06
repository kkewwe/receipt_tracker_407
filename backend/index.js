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
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }),
  body('userType').isIn(['client', 'restaurant']),
  body('username').custom((value, { req }) => {
    if (req.body.userType === 'restaurant' && !value) {
      throw new Error('Username is required for restaurants');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType, name, username } = req.body;
    const Model = userType === 'client' ? Client : Restaurant;
    
    // Check for existing user - different checks for client and restaurant
    const searchQuery = userType === 'client' 
      ? { $or: [{ email }, { name }] }
      : { $or: [{ email }, { username }, { name }] };
    
    const existingUser = await Model.findOne(searchQuery);
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (userType === 'client' && existingUser.name === name) {
        return res.status(400).json({ message: 'Name already exists' });
      }
      if (userType === 'restaurant') {
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        if (existingUser.name === name) {
          return res.status(400).json({ message: 'Restaurant name already exists' });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      email,
      password: hashedPassword,
      name,
      ...(userType === 'restaurant' && {
        username,
        restaurantID: `REST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        address: req.body.address,
        description: req.body.description || '',
        categories: req.body.categories ? req.body.categories : [],
        businessHours: {
          monday: { open: '9:00', close: '17:00' },
          tuesday: { open: '9:00', close: '17:00' },
          wednesday: { open: '9:00', close: '17:00' },
          thursday: { open: '9:00', close: '17:00' },
          friday: { open: '9:00', close: '17:00' },
          saturday: { open: '10:00', close: '15:00' },
          sunday: { open: 'closed', close: 'closed' }
        }
      })
    };

    const newUser = new Model(userData);
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
    const { username, name, password, userType } = req.body;
    
    // Validate required fields based on user type
    if (userType === 'client' && (!name || !password)) {
      return res.status(400).json({ message: 'Please provide name and password' });
    }
    if (userType === 'restaurant' && (!username || !password)) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const Model = userType === 'client' ? Client : Restaurant;
    
    // Different login field based on user type
    const searchQuery = userType === 'client' ? { name } : { username };
    
    const user = await Model.findOne(searchQuery);
    if (!user) {
      return res.status(401).json({ 
        message: userType === 'client' ? 'User name not found' : 'Username not found'
      });
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