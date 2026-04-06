const mongoose = require('mongoose');

const restaurantProfileSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String
    },
    brandingColor: {
        type: String,
        default: '#ea580c' // Orange-600
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'glass'],
        default: 'glass'
    },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'pro', 'enterprise'],
        default: 'trial'
    },
    contactEmail: {
        type: String
    },
    address: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('RestaurantProfile', restaurantProfileSchema);
