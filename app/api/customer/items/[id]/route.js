import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodItem from '@/models/FoodItem';
import RestaurantProfile from '@/models/RestaurantProfile';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Missing item ID' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch Item
    const item = await FoodItem.findById(id);
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    // 2. Fetch Restaurant Profile for branding
    const profile = await RestaurantProfile.findOne({ restaurantId: item.restaurantId });

    // 3. Track View (Async)
    item.viewCount += 1;
    await item.save();

    return NextResponse.json({ item, profile });
  } catch (err) {
    console.error('Customer Item API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
