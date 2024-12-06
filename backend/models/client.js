const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
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

// Add pre-save middleware to handle clientID generation
clientSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.clientID = `CL${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

clientSchema.index({ email: 1 });
clientSchema.index({ name: 1 }); // Add index for name lookups
clientSchema.index({ 'orders.scanDate': -1 });

module.exports = mongoose.model('Client', clientSchema);