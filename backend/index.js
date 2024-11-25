const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const Order = require('./models/order');
const Client = require('./models/client');
const Dish = require('./models/dish');
const Restaurant = require('./models/restaurant');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = 'your_jwt_secret_key';

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/receiptApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

/**
 * Middleware to authenticate using JWT
 */
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
};

// ==================== REGISTRATION ====================

// Register a new user
app.post('/register-user', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existingUser = await Client.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Client({ email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id, 'user');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a new restaurant
app.post('/register-restaurant', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const { name, address, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) return res.status(400).json({ error: 'Restaurant already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newRestaurant = new Restaurant({ name, address, email, password: hashedPassword });
    await newRestaurant.save();

    const token = generateToken(newRestaurant._id, 'restaurant');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== LOGIN ====================

// User login
app.post('/login-user', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Client.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = generateToken(user._id, 'user');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurant login
app.post('/login-restaurant', async (req, res) => {
  const { email, password } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) return res.status(400).json({ error: 'Restaurant not found' });

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = generateToken(restaurant._id, 'restaurant');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROTECTED ROUTES ====================

// Example of a protected route
app.get('/dashboard', authenticateToken, async (req, res) => {
  res.json({ message: `Welcome ${req.user.role}` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
