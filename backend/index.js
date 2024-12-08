// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Load environment variables
dotenv.config();

const Client = require('./models/client');
const Restaurant = require('./models/restaurant');
const Dish = require('./models/dish');
const Order = require('./models/order');
const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, userType, name, username } = req.body;

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

    const token = jwt.sign(
      { userId: newUser._id, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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

    const token = jwt.sign(
      { userId: user._id, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Add restaurantID to response for restaurant users
    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      userType,
      // Include restaurantID only for restaurant users
      ...(userType === 'restaurant' && { restaurantID: user.restaurantID })
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/restaurant/menu/:restaurantID', async (req, res) => {
  try {
    const { restaurantID } = req.params;
    
    // Add logging
    console.log('Fetching menu for restaurant:', restaurantID);

    const dishes = await Dish.find({ 
      restaurantID,
      isAvailable: true 
    });

    console.log('Found dishes:', dishes.length);
    
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ 
      message: 'Error fetching menu',
      error: error.message 
    });
  }
});

// Add dish endpoint
app.post('/api/restaurant/dishes', async (req, res) => {
  try {
    const { name, description, category, cost, restaurantID, isAvailable } = req.body;

    // Add validation
    if (!name || !cost || !restaurantID) {
      return res.status(400).json({
        message: 'Name, price, and restaurant ID are required'
      });
    }

    // Create new dish
    const dish = new Dish({
      dishID: `DISH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      cost,
      restaurantID,
      isAvailable: isAvailable ?? true
    });

    await dish.save();
    console.log('Dish saved:', dish);

    res.status(201).json({
      message: 'Dish created successfully',
      dish
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({
      message: 'Failed to create dish',
      error: error.message
    });
  }
});

app.post('/api/restaurant/create-order', async (req, res) => {
  try {
    const { restaurantID, dishes } = req.body;

    // Validate input
    if (!restaurantID || !dishes || !dishes.length) {
      return res.status(400).json({
        message: 'Restaurant ID and dishes are required'
      });
    }

    console.log('Creating order:', { restaurantID, dishes });

    // Fetch dish details to calculate totals
    const dishDetails = await Dish.find({
      dishID: { $in: dishes.map(d => d.dishID) },
      restaurantID
    });

    if (!dishDetails.length) {
      return res.status(404).json({
        message: 'No valid dishes found'
      });
    }

    // Calculate order totals
    const dishMap = Object.fromEntries(
      dishDetails.map(dish => [dish.dishID, dish])
    );

    const orderDishes = dishes.map(dish => ({
      dishID: dish.dishID,
      name: dishMap[dish.dishID].name,
      quantity: dish.quantity,
      price: dishMap[dish.dishID].cost
    }));

    const subtotal = orderDishes.reduce(
      (sum, dish) => sum + (dish.price * dish.quantity),
      0
    );

    // Create new order
    const order = new Order({
      orderID: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      restaurantID,
      dishes: orderDishes,
      subtotal,
      total: subtotal, // Add tax/discount logic if needed
      status: 'pending'
    });

    await order.save();
    console.log('Order saved:', order);

    // Generate QR code
    const qrData = JSON.stringify({
      orderID: order.orderID,
      restaurantID,
      total: order.total
    });

    const qrCode = await QRCode.toDataURL(qrData);

    res.status(201).json({
      message: 'Order created successfully',
      order,
      qrCode
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});