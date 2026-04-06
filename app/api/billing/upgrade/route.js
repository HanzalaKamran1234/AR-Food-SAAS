import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import RestaurantProfile from '@/models/RestaurantProfile';
import { verifyAuth } from '@/lib/authHelper';

export async function POST(req) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (plan !== 'pro') {
      return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
    }

    await dbConnect();

    // 1. Update User subscription status
    const dbUser = await User.findByIdAndUpdate(
      user._id,
      { subscriptionStatus: 'pro' },
      { new: true }
    );

    // 2. Also ensure RestaurantProfile matches (since Branding UI uses it)
    await RestaurantProfile.findOneAndUpdate(
      { restaurantId: user._id },
      { subscriptionStatus: 'pro' },
      { new: true, upsert: true }
    );

    return NextResponse.json({ 
        message: 'Successfully upgraded to Pro!', 
        status: dbUser.subscriptionStatus 
    });
  } catch (err) {
    console.error('Upgrade API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
