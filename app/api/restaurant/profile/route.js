import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RestaurantProfile from '@/models/RestaurantProfile';
import { verifyAuth, hasRole } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);

    if (!user || !hasRole(user, ['Restaurant', 'Admin'])) {
	  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}

    await dbConnect();
    
    // Find profile
    let profile = await RestaurantProfile.findOne({ restaurantId: user._id });

    if (!profile && user.role === 'Restaurant') {
        // Create a default profile if it doesn't exist
        profile = new RestaurantProfile({
            restaurantId: user._id,
            name: 'My Restaurant'
        });
        await profile.save();
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Profile GET API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await verifyAuth(req);

    if (!user || !hasRole(user, ['Restaurant', 'Admin'])) {
	  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}

    const { name, logoUrl, brandingColor, address, contactEmail } = await req.json();

    await dbConnect();

    const profile = await RestaurantProfile.findOneAndUpdate(
      { restaurantId: user._id },
      { name, logoUrl, brandingColor, address, contactEmail },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Profile PUT API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
