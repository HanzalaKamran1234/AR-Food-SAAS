import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodItem from '@/models/FoodItem';
import { verifyAuth, hasRole } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);

    if (!user || !hasRole(user, ['Restaurant', 'Admin'])) {
	  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}

    await dbConnect();
    
    // Admins can see everything, Restaurants only see their own
    const query = user.role === 'Admin' ? {} : { restaurantId: user._id };
    const items = await FoodItem.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('Menu GET API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);

    if (!user || !hasRole(user, ['Restaurant', 'Admin'])) {
	  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}

    const { name, description, price, modelUrl, imageUrl } = await req.json();

    if (!name || !description || !price || !modelUrl || !imageUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const newItem = new FoodItem({
      restaurantId: user._id,
      name,
      description,
      price,
      modelUrl,
      imageUrl
    });

    await newItem.save();
    return NextResponse.json({ message: 'Item created successfully', item: newItem }, { status: 201 });
  } catch (err) {
    console.error('Menu POST API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
