const mongoose = require('mongoose');

const clientScanSchema = new mongoose.Schema({
  scanId: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: String,
    required: true,
    ref: 'Client'
  },
  restaurantId: {
    type: String,
    required: true,
    ref: 'Restaurant'
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order'
  },
  restaurantName: String,
  total: {
    type: Number,
    required: true
  },
  items: [{
    dishID: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ClientScan', clientScanSchema);