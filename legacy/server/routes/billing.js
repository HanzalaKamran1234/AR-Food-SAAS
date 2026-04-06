const express = require('express');
const router = express.Router();
const RestaurantProfile = require('../models/RestaurantProfile');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

// POST /api/billing/upgrade
// Simulates a successful Stripe Checkout. In production, this would be a webhook handler.
router.post('/upgrade', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const { plan } = req.body;
        
        if (plan !== 'pro') {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Update profile status
        const profile = await RestaurantProfile.findOneAndUpdate(
            { restaurantId: req.user._id },
            { subscriptionStatus: 'pro' },
            { new: true, upsert: true }
        );

        res.json({ 
            message: 'Successfully upgraded to Pro!', 
            status: profile.subscriptionStatus 
        });
    } catch (err) {
        console.error('Upgrade Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/billing/status
router.get('/status', verifyAuth, requireRole(['Restaurant']), async (req, res) => {
    try {
        const profile = await RestaurantProfile.findOne({ restaurantId: req.user._id });
        res.json({ status: profile ? profile.subscriptionStatus : 'trial' });
    } catch (err) {
        console.error('Status Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
