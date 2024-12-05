const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderID: { type: String, unique: true },
  customerName: String,
  restaurantID: { type: String, ref: 'Restaurant' },
  orderDate: { type: Date, default: Date.now },
  subtotal: Number,
  discount: Number,
  total: Number,
  dishes: [{
    dishID: { type: String, ref: 'Dish' },
    name: String,
    quantity: Number,
    price: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
