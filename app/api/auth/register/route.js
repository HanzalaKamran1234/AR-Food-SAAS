import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { firebaseUid, email, role } = await req.json();

    if (!firebaseUid || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Default to Restaurant for our SaaS model
    const validRoles = ['Admin', 'Restaurant', 'Customer'];
    const assignedRole = validRoles.includes(role) ? role : 'Restaurant';

    const newUser = new User({
      firebaseUid,
      email,
      role: assignedRole,
      subscriptionStatus: 'trial'
    });

    await newUser.save();
    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (err) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
