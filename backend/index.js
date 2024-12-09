// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const ClientScan = require('./models/clientScan');
const Client = require('./models/client');
const Restaurant = require('./models/restaurant');
const Dish = require('./models/dish');
const Order = require('./models/order');
const app = express();

// Load environment variables
dotenv.config();

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

    if (!restaurantID || !dishes || !dishes.length) {
      return res.status(400).json({
        message: 'Restaurant ID and dishes are required',
      });
    }

    console.log('Creating order:', { restaurantID, dishes });

    // Fetch restaurant details
    const restaurant = await Restaurant.findOne({ restaurantID });
    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found',
      });
    }

    // Fetch dish details to calculate totals
    const dishDetails = await Dish.find({
      dishID: { $in: dishes.map(d => d.dishID) },
      restaurantID,
    });

    if (!dishDetails.length) {
      return res.status(404).json({
        message: 'No valid dishes found',
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
      price: dishMap[dish.dishID].cost,
    }));

    const subtotal = orderDishes.reduce(
      (sum, dish) => sum + dish.price * dish.quantity,
      0
    );

    // Create new order
    const order = new Order({
      orderID: `ORDER-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      restaurantID,
      dishes: orderDishes,
      subtotal,
      total: subtotal,
      status: 'pending',
    });

    await order.save();
    console.log('Order saved:', order);

    // Generate QR code with restaurant name
    const qrData = JSON.stringify({
      orderID: order.orderID,
      restaurantID,
      restaurantName: restaurant.name,
      dishes: orderDishes,
      total: order.total,
      date: new Date(),
    });

    const qrCode = await QRCode.toDataURL(qrData);

    restaurant.monthlyOrders += 1;
    restaurant.monthlyRevenue += subtotal;

    await restaurant.save();

    res.status(201).json({
      message: 'Order created successfully',
      order,
      qrCode,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
    });
  }
});


// Save client scan
app.post('/api/client/scans', async (req, res) => {
  try {
    const { clientId, orderId, restaurantId, restaurantName, total, items } = req.body;

    const scan = new ClientScan({
      scanId: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      orderId,
      restaurantId,
      restaurantName,
      total,
      items,
      date: new Date()
    });

    await scan.save();
    console.log('Scan saved:', scan);

    res.status(201).json({
      message: 'Scan saved successfully',
      scanId: scan.scanId
    });
  } catch (error) {
    console.error('Error saving scan:', error);
    res.status(500).json({
      message: 'Failed to save scan',
      error: error.message
    });
  }
});

// Get client's scan history
app.get('/api/client/scans/:clientId', async (req, res) => {
  try {
    const scans = await ClientScan.find({ 
      clientId: req.params.clientId 
    }).sort({ date: -1 });

    res.json(scans);
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({
      message: 'Failed to fetch scan history',
      error: error.message
    });
  }
});

app.post('/api/client/checkScan', async (req, res) => {
  try {
    const { clientId, orderId } = req.body;
    
    const existingScan = await ClientScan.findOne({
      clientId,
      orderId
    });

    res.json({ exists: !!existingScan });
  } catch (error) {
    console.error('Error checking scan:', error);
    res.status(500).json({ message: 'Error checking scan' });
  }
});

// Get client dashboard data
app.get('/api/client/dashboard/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Get all scans for the client
    const allScans = await ClientScan.find({ clientId });
    
    // Calculate total spent
    const totalSpent = allScans.reduce((sum, scan) => sum + scan.total, 0);
    
    // Calculate monthly stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyScans = allScans.filter(scan => 
      new Date(scan.date) >= monthStart
    );
    const monthlySpent = monthlyScans.reduce((sum, scan) => sum + scan.total, 0);

    // Get recent scans
    const recentScans = await ClientScan.find({ clientId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      stats: {
        totalScans: allScans.length,
        totalSpent: totalSpent.toFixed(2),
        monthlySpent: monthlySpent.toFixed(2),
      },
      recentScans
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get specific scan details
app.get('/api/client/scan/:scanId', async (req, res) => {
  try {
    const scan = await ClientScan.findOne({ 
      scanId: req.params.scanId 
    });

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    res.json(scan);
  } catch (error) {
    console.error('Error fetching scan:', error);
    res.status(500).json({
      message: 'Failed to fetch scan details',
      error: error.message
    });
  }
});
app.post('/api/auth/edit-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Determine the user type
    const user = await Client.findById(userId) || await Restaurant.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});


// delete profile
app.post('/api/auth/delete-profile', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Determine the user type (you may need to send `userType` from the frontend)
    const user = await Client.findById(userId) || await Restaurant.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Delete the user
    await user.remove();

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Failed to delete profile', error: error.message });
  }
});


// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});