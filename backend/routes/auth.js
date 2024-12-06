import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Client from '../models/client.js';
import Restaurant from '../models/restaurant.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, name, username, address } = req.body;

    const Model = userType === 'client' ? Client : Restaurant;

    const existingUser = await Model.findOne({ 
      $or: [
        { email },
        ...(userType === 'client' 
          ? [{ name }] 
          : [{ username }, { name }])
      ] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (userType === 'client' && existingUser.name === name) {
        return res.status(400).json({ message: 'Name already exists' });
      }
      if (userType === 'restaurant' && existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (userType === 'restaurant' && existingUser.name === name) {
        return res.status(400).json({ message: 'Restaurant name already exists' });
      }
    }

    if (userType === 'restaurant' && !address) {
      return res.status(400).json({ message: 'Address is required for restaurants' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new Model({
      email,
      password: hashedPassword,
      name,
      ...(userType === 'restaurant' && { 
        username,
        address,
        restaurantID: `REST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }),
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
      userId: newUser._id,
      userType
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, name, password, userType } = req.body;
    const Model = userType === 'client' ? Client : Restaurant;

    // Different login field based on user type
    const searchQuery = userType === 'client' 
      ? { name } // Clients login with name
      : { username }; // Restaurants login with username

    const user = await Model.findOne(searchQuery);
    if (!user) {
      return res.status(401).json({ 
        message: userType === 'client' 
          ? 'User name not found' 
          : 'Username not found' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Password incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id, userType },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      userType
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;