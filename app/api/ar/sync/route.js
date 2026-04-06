import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req) {
  try {
    const { sessionId, state } = await req.json();

    if (!sessionId || !state) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Trigger Pusher event for the specific session
    if (pusherServer) {
        await pusherServer.trigger(`ar-session-${sessionId}`, 'sync-state', {
            state,
            timestamp: Date.now()
        });
    }

    return NextResponse.json({ message: 'Sync successful' });
  } catch (err) {
    console.error('AR Sync API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
