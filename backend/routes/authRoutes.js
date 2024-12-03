import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Client from '../models/client.js';
import Restaurant from '../models/restaurant.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, name } = req.body;
    
    const Model = userType === 'client' ? Client : Restaurant;
    
    const existingUser = await Model.findOne({ email });
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
      'your_jwt_secret', 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser._id
    });

  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    const Model = userType === 'client' ? Client : Restaurant;
    
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isValidPassword = await bcrypt.hash(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign(
      { userId: user._id, userType },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;