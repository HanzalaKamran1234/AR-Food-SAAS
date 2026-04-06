const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const RestaurantProfile = require('../models/RestaurantProfile');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

// Get all food items for the logged-in restaurant
router.get('/items', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const items = await FoodItem.find({ restaurantId: req.user._id }).sort({ createdAt: -1 });
        res.json({ items });
    } catch (err) {
        console.error('Fetch Items Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new food item
router.post('/items', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const { name, description, price, modelUrl, imageUrl } = req.body;

        if (!name || !description || price == null || !modelUrl || !imageUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newItem = new FoodItem({
            restaurantId: req.user._id,
            name,
            description,
            price,
            modelUrl,
            imageUrl
        });

        await newItem.save();
        res.status(201).json({ message: 'Food item created successfully', item: newItem });
    } catch (err) {
        console.error('Create Item Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE a food item
router.delete('/items/:id', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const itemId = req.params.id;
        
        // Ensure the item belongs to the requester
        const item = await FoodItem.findOneAndDelete({ _id: itemId, restaurantId: req.user._id });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found or unauthorized' });
        }

        res.json({ message: 'Food item deleted successfully' });
    } catch (err) {
        console.error('Delete Item Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET profile
router.get('/profile', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        let profile = await RestaurantProfile.findOne({ restaurantId: req.user._id });
        if (!profile) {
            // Create a default profile if not exists
            profile = new RestaurantProfile({ 
                restaurantId: req.user._id,
                name: req.user.email.split('@')[0], 
                brandingColor: '#ea580c' 
            });
            await profile.save();
        }
        res.json({ profile });
    } catch (err) {
        console.error('Profile Fetch Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// UPDATE profile
router.put('/profile', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const { name, brandingColor, logoUrl, address, theme } = req.body;
        const profile = await RestaurantProfile.findOneAndUpdate(
            { restaurantId: req.user._id },
            { name, brandingColor, logoUrl, address, theme },
            { new: true, upsert: true }
        );
        res.json({ message: 'Profile updated successfully', profile });
    } catch (err) {
        console.error('Profile Update Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET Analytics summary
router.get('/analytics', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const items = await FoodItem.find({ restaurantId: req.user._id }).sort({ viewCount: -1 }).limit(10);
        
        const summary = {
            totalItems: await FoodItem.countDocuments({ restaurantId: req.user._id }),
            totalViews: items.reduce((acc, item) => acc + (item.viewCount || 0), 0),
            totalARInteractions: items.reduce((acc, item) => acc + (item.arInteractions || 0), 0),
            topItems: items.map(item => ({
                id: item._id,
                name: item.name,
                views: item.viewCount || 0,
                arInteractions: item.arInteractions || 0
            }))
        };
        
        res.json({ analytics: summary });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
