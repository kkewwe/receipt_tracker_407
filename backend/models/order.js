const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderID: { type: String, unique: true },
  clientID: String,
  restaurantID: String,
  orderDate: Date,
  total: Number,
  dishes: [String], 
});

module.exports = mongoose.model('Order', orderSchema);
