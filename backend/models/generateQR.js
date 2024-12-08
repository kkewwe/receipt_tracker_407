// backend/models/generateQR.js
const express = require('express');
const QRCode = require('qrcode');
const Dish = require('./dish');

const router = express.Router();

router.post('/generate-qr', async (req, res) => {
  try {
    const { dishes, restaurantID } = req.body;

    if (!dishes || dishes.length === 0) {
      return res.status(400).json({ message: 'No dishes provided to generate QR code.' });
    }

    const selectedDishes = await Dish.find({
      dishID: { $in: dishes },
      restaurantID,
    });

    if (selectedDishes.length === 0) {
      return res.status(404).json({ message: 'No matching dishes found.' });
    }

    const order = {
      restaurantID,
      dishes: selectedDishes.map((dish) => ({
        dishID: dish.dishID,
        name: dish.name,
        price: dish.cost,
      })),
    };

    const qrData = JSON.stringify(order);
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({
      qrCode,
      message: 'QR code generated successfully!'
    });
  } catch (error) {
    console.error('QR Generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
  }
});

module.exports = router;