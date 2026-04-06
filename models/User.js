import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Restaurant', 'Customer'],
        default: 'Restaurant' // Updated default for SaaS model
    },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'pro'],
        default: 'trial'
    }
}, { timestamps: true });

// Next.js model initialization to prevent OverwriteModelError
export default mongoose.models.User || mongoose.model('User', userSchema);
