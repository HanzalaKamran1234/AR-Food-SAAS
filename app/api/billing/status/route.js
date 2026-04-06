import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find billing status from User model
    const dbUser = await User.findById(user._id);

    return NextResponse.json({ 
        status: dbUser ? dbUser.subscriptionStatus : 'trial' 
    });
  } catch (err) {
    console.error('Billing Status API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
