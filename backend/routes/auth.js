import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Client from '../models/client.js';
import Restaurant from '../models/restaurant.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, name, address } = req.body;

    const Model = userType === 'client' ? Client : Restaurant;

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (userType === 'restaurant' && !address) {
      return res.status(400).json({ message: 'Address is required for restaurants' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new Model({
      email,
      password: hashedPassword,
      name,
      ...(userType === 'restaurant' && { address }),
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userType },
      'your_jwt_secret',  // Replace with a secure method in production
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser._id,
    });

  } catch (error) {
    console.error(error.message); // Replace with a logger in production
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

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign(
      { userId: user._id, userType },
      'your_jwt_secret',  // Replace with a secure method in production
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
    });

  } catch (error) {
    console.error(error.message); // Replace with a logger in production
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;