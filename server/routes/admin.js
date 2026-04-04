const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/users', verifyAuth, requireRole(['Admin']), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-__v');
        res.json({ users });
    } catch (err) {
        console.error('Fetch Users Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a user (Admin only)
router.delete('/users/:id', verifyAuth, requireRole(['Admin']), async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find the user in our DB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found in DB' });
        }

        // 1. Delete from Firebase Auth
        try {
            await admin.auth().deleteUser(user.firebaseUid);
        } catch (firebaseErr) {
            console.error('Firebase Deletion Error:', firebaseErr.message);
            // We may continue deleting from our DB even if Firebase complains 
            // (e.g. if the user is already gone from Firebase)
        }

        // 2. Delete from MongoDB
        await User.findByIdAndDelete(userId);

        // TODO: In the future, also delete their uploaded 3D Models / Foods here

        res.json({ message: 'User successfully deleted' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
