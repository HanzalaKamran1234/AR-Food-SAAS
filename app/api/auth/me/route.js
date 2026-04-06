import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Auth/Me API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
