const admin = require('firebase-admin');
const User = require('../models/User');

const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Fetch user profile from DB to get the role
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: user.role,
            _id: user._id
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { verifyAuth, requireRole };
