const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
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

// Delete a food item
router.delete('/items/:id', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const itemId = req.params.id;
        
        // Ensure the item belongs to the requester
        const item = await FoodItem.findOneAndDelete({ _id: itemId, restaurantId: req.user._id });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found or unauthorized' });
        }

        // Note: Actual Firebase Storage deletion of files from modelUrl & imageUrl 
        // can be orchestrated via front-end SDK logic or a backend scheduled cleanup task.

        res.json({ message: 'Food item deleted successfully' });
    } catch (err) {
        console.error('Delete Item Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
