// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderID: { 
    type: String, 
    unique: true, 
    required: true 
  },
  restaurantID: { 
    type: String, 
    required: true,
    ref: 'Restaurant' 
  },
  dishes: [{
    dishID: { 
      type: String,
      required: true,
      ref: 'Dish' 
    },
    name: String,
    quantity: Number,
    price: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);