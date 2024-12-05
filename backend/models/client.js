const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  orders: [{
    orderID: { type: String, ref: 'Order' },
    restaurantID: { type: String, ref: 'Restaurant' },
    scanDate: { type: Date, default: Date.now },
    total: Number,
    discount: Number,
    saved: Number
  }],
  metrics: {
    totalScans: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    lastScanDate: Date
  }
}, { timestamps: true });

clientSchema.index({ email: 1 });
clientSchema.index({ 'orders.scanDate': -1 });

module.exports = mongoose.model('Client', clientSchema);