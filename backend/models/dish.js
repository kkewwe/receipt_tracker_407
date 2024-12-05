const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  dishID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  category: String,
  cost: { type: Number, required: true },
  restaurantID: { type: String, required: true, ref: 'Restaurant' },
  isAvailable: { type: Boolean, default: true },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Dish', dishSchema);
