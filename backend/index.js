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
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }),
    body('userType').isIn(['client', 'restaurant'])
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password, userType, name, username } = req.body;
      const Model = userType === 'client' ? Client : Restaurant;
      
      // Check for existing user by email or username
      const existingUser = await Model.findOne({ 
        $or: [{ email }, { username }] 
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const userData = {
        email,
        password: hashedPassword,
        username,
        name,
        ...(userType === 'restaurant' && { 
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
      const { username, password, userType } = req.body;
      
      if (!username || !password || !userType) {
        return res.status(400).json({ 
          message: 'Please provide all required fields'
        });
      }
  
      const Model = userType === 'client' ? Client : Restaurant;
      
      const user = await Model.findOne({ username });
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