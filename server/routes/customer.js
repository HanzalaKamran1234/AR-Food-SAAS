const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const { verifyAuth } = require('../middleware/authMiddleware');

// Get all restaurants for customers to browse
router.get('/restaurants', verifyAuth, async (req, res) => {
    try {
        const restaurants = await User.find({ role: 'Restaurant' })
            .select('_id email createdAt')
            .sort({ createdAt: -1 });

        res.json({ restaurants });
    } catch (err) {
        console.error('Fetch Restaurants Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get menu items for a specific restaurant
router.get('/restaurants/:id/items', verifyAuth, async (req, res) => {
    try {
        const restaurantId = req.params.id;
        
        // Ensure the ID is a valid restaurant
        const restaurant = await User.findOne({ _id: restaurantId, role: 'Restaurant' });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const items = await FoodItem.find({ restaurantId }).sort({ createdAt: -1 });
        
        res.json({ 
            restaurant: { id: restaurant._id, email: restaurant.email },
            items 
        });
    } catch (err) {
        console.error('Fetch Menu Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Track analytics
router.post('/items/track', async (req, res) => {
    try {
        const { modelUrl, type } = req.body;
        // Tracking can be anonymous (for customers) or linked if we had customer accounts
        const item = await FoodItem.findOne({ modelUrl });
        if (item) {
            if (type === 'view') item.viewCount += 1;
            if (type === 'interaction') item.arInteractions += 1;
            await item.save();
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Track Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
