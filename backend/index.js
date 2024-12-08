const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Load environment variables before using them
dotenv.config();

const Client = require('./models/client');
const Restaurant = require('./models/restaurant');
const Dish = require('./models/dish');

const app = express();

// Debug logging for JWT setup
console.log('Environment Check:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('JWT_SECRET type:', typeof process.env.JWT_SECRET);

// Validate and prepare JWT_SECRET
let JWT_SECRET;
try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    // Ensure the secret is a valid string and trim any whitespace
    JWT_SECRET = String(process.env.JWT_SECRET).trim();
    
    if (JWT_SECRET.length === 0) {
        throw new Error('JWT_SECRET is empty after trimming');
    }
    
    // Try creating a test token
    const testToken = jwt.sign(
        { test: true },
        JWT_SECRET,
        { 
            algorithm: 'HS256',
            expiresIn: '1s'
        }
    );
    
    console.log('Test token created successfully');
    
    // Try verifying the test token
    const verified = jwt.verify(testToken, JWT_SECRET);
    console.log('Test token verified successfully');
    
} catch (error) {
    console.error('JWT Setup Error:', error.message);
    console.error('Error Stack:', error.stack);
    process.exit(1);
}

app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, userType, name, username } = req.body;

        if (!email || !password || !userType || !name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const Model = userType === 'client' ? Client : Restaurant;
        const searchQuery = userType === 'client'
            ? { $or: [{ email }, { name }] }
            : { $or: [{ email }, { username }, { name }] };

        const existingUser = await Model.findOne(searchQuery);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
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
                categories: req.body.categories || [],
                businessHours: req.body.businessHours || {
                    monday: { open: '9:00', close: '17:00' },
                    tuesday: { open: '9:00', close: '17:00' },
                },
            }),
        };

        const newUser = new Model(userData);
        await newUser.save();

        // Log the state right before signing
        console.log('Attempting to sign token with:');
        console.log('- Payload:', { userId: newUser._id, userType });
        console.log('- Secret length:', JWT_SECRET.length);

        const token = jwt.sign(
            { 
                userId: newUser._id, 
                userType 
            }, 
            JWT_SECRET, 
            { 
                algorithm: 'HS256',
                expiresIn: '1h'
            }
        );

        console.log('Token generated successfully');

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser._id,
      userType,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, name, password, userType } = req.body;

    const Model = userType === 'client' ? Client : Restaurant;
    const searchQuery = userType === 'client' ? { name } : { username };

    const user = await Model.findOne(searchQuery);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id, userType }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, userId: user._id, userType });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// QR Code Generation Endpoint
app.post('/generate-qr', async (req, res) => {
  console.log('Received request at /generate-qr:', req.body);

  try {
    const { dishes, restaurantID } = req.body;

    if (!dishes || dishes.length === 0) {
      return res.status(400).json({ message: 'No dishes provided to generate QR code.' });
    }

    const selectedDishes = await Dish.find({ dishID: { $in: dishes }, restaurantID });
    if (!selectedDishes || selectedDishes.length === 0) {
      return res.status(404).json({ message: 'No matching dishes found.' });
    }

    const order = {
      restaurantID,
      dishes: selectedDishes.map((dish) => ({
        dishID: dish.dishID,
        name: dish.name,
        price: dish.cost,
      })),
    };

    const qrData = JSON.stringify(order);
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrCode, message: 'QR Code generated successfully' });
  } catch (error) {
    console.error('QR Generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
