const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
// Called from frontend immediately after Firebase Signup to persist role
router.post('/register', async (req, res) => {
    try {
        const { firebaseUid, email, role } = req.body;

        if (!firebaseUid || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ firebaseUid });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Enforce valid role - Default to Restaurant for our SaaS model
        const validRoles = ['Admin', 'Restaurant', 'Customer'];
        const assignedRole = validRoles.includes(role) ? role : 'Restaurant';

        const newUser = new User({
            firebaseUid,
            email,
            role: assignedRole
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/auth/me
// Simple endpoint to test auth middleware
const { verifyAuth } = require('../middleware/authMiddleware');
router.get('/me', verifyAuth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
