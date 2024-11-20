const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  dishID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  restaurantID: { type: String, required: true, ref: 'Restaurant' },
});

module.exports = mongoose.model('Dish', dishSchema);
