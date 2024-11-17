const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
