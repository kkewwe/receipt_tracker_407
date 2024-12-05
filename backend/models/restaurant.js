const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  logo: String,
  description: String,
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  categories: [String],
  totalOrders: { type: Number, default: 0 },
  stats: {
    monthlyOrders: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
  }
}, { timestamps: true });

restaurantSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);