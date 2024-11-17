const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientID: { type: String, unique: true, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Client', clientSchema);
