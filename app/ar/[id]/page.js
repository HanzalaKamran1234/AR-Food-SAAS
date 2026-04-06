'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher';
import Script from 'next/script';

export default function ARViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pusher / Sync state
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const modelViewerRef = useRef(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadARData();
    setupPusher();
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
    };
  }, [id]);

  const loadARData = async () => {
    try {
      // 1. Fetch Item Data (Public Route)
      // Note: We need a public endpoint for customers to see the AR model
      const res = await fetch(`/api/customer/items/${id}`);
      if (!res.ok) throw new Error("Food item not found.");
      
      const data = await res.json();
      setItem(data.item);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupPusher = () => {
    // We use a simplified AR session ID based on the item ID 
    // or a shared room code if we wanted true multiplayer.
    // For now, we'll listen for sync events on this item's specific channel.
    const pusher = getPusherClient();
    pusherRef.current = pusher;

    const channel = pusher.subscribe(`ar-session-${id}`);
    channelRef.current = channel;

    channel.bind('sync-state', (data) => {
      if (!isSyncing && modelViewerRef.current) {
        const { state } = data;
        // In model-viewer, we can sync rotation, scale, etc.
        // For simple MVP sync:
        if (state.cameraOrbit) {
          modelViewerRef.current.cameraOrbit = state.cameraOrbit;
        }
      }
    });
  };

  const broadcastState = () => {
    if (!id || !modelViewerRef.current) return;

    fetch('/api/ar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: id,
        state: {
          cameraOrbit: modelViewerRef.current.cameraOrbit
        }
      })
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-10">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-t-4 border-orange-600 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="text-white font-black uppercase tracking-widest text-xs animate-pulse">Initializing AR Engine...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center space-y-4">
      <h1 className="text-white text-2xl font-black">Dish Not Found</h1>
      <p className="text-gray-500">The dish you're looking for doesn't exist or has been removed.</p>
      <button onClick={() => router.push('/')} className="bg-white text-black px-6 py-2 rounded-full font-bold">Go Home</button>
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none">
      <Script 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" 
      />

      {/* AR View */}
      <model-viewer
        ref={modelViewerRef}
        src={item.modelUrl}
        ios-src=""
        alt={item.name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        exposure="1"
        className="w-full h-full"
        onCameraChange={() => {
            // Optional: Broadcast state on interaction for real-time sync
            // broadcastState();
        }}
      >
        {/* AR UI Elements */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 max-w-[200px]">
                <h1 className="text-white text-lg font-black truncate">{item.name}</h1>
                <p className="text-orange-500 font-black text-xl">${item.price}</p>
            </div>
            
            <button 
                slot="ar-button" 
                className="pointer-events-auto bg-orange-600 text-white px-8 py-3 rounded-full font-black shadow-2xl hover:bg-orange-700 transition transform active:scale-95"
            >
                View in Reality
            </button>
        </div>

        {/* Restaurant Branding (from Profile) */}
        {profile && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-center space-y-2">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Experience by</span>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/5">
                    <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: profile.brandingColor || '#ea580c' }} 
                    />
                    <span className="text-white text-xs font-bold uppercase">{profile.name}</span>
                </div>
            </div>
        )}
      </model-viewer>

      {/* Loading Bar Mockup */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full bg-orange-600 animate-pulse" style={{ width: '100%' }} />
      </div>
    </div>
  );
}
