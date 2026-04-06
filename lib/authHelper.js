import admin from './firebaseAdmin';
import dbConnect from './dbConnect';
import User from '@/models/User';

export async function verifyAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Connect to DB
    await dbConnect();
    
    // Fetch user profile from DB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: user.role,
      _id: user._id.toString()
    };
  } catch (error) {
    console.error('Auth Verification Error:', error);
    return null;
  }
}

export function hasRole(user, roles) {
  return user && roles.includes(user.role);
}
