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
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});