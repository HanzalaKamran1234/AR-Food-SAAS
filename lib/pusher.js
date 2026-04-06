import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

let pusherServerInstance = null;

export const getPusherServer = () => {
    if (!pusherServerInstance && process.env.PUSHER_APP_ID) {
        pusherServerInstance = new PusherServer({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.NEXT_PUBLIC_PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            useTLS: true,
        });
    }
    return pusherServerInstance;
};

// Also export as a constant for easy server-side use
export const pusherServer = typeof window === 'undefined' ? getPusherServer() : null;

export const getPusherClient = () => {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null;
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });
};
