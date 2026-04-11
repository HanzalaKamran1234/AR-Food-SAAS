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

    if (!name || !price || !modelUrl || !imageUrl) {
      return NextResponse.json({ message: 'Missing required fields (name, price, modelUrl, imageUrl)' }, { status: 400 });
    }

    await dbConnect();

    const newItem = new FoodItem({
      restaurantId: user._id,
      name,
      description: description || '',
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

export async function DELETE(req) {
  try {
    const user = await verifyAuth(req);

    if (!user || !hasRole(user, ['Restaurant', 'Admin'])) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing item ID' }, { status: 400 });
    }

    await dbConnect();

    // Ensure the item belongs to this restaurant (unless admin)
    const query = user.role === 'Admin'
      ? { _id: id }
      : { _id: id, restaurantId: user._id };

    const deleted = await FoodItem.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json({ message: 'Item not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Menu DELETE API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

