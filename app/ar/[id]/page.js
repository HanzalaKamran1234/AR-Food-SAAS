'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ARViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const modelViewerRef = useRef(null);

  // Step 1: Dynamically load the model-viewer script ONCE
  useEffect(() => {
    // Check if already loaded
    if (customElements.get('model-viewer')) {
      setScriptReady(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    script.onload = () => setScriptReady(true);
    script.onerror = () => {
      console.error('Failed to load model-viewer script');
      setScriptReady(true); // Still attempt render, but note the failure
    };
    document.head.appendChild(script);
  }, []);

  // Step 2: Fetch item data
  useEffect(() => {
    if (!id) return;
    const loadARData = async () => {
      try {
        const res = await fetch(`/api/customer/items/${id}`);
        if (!res.ok) throw new Error('Food item not found.');
        const data = await res.json();
        setItem(data.item);
        setProfile(data.profile);
      } catch (err) {
        console.error('AR Load Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadARData();
  }, [id]);

  // Handle AR button click — triggers model-viewer's built-in AR launch
  const handleARClick = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 px-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-t-4 border-orange-500 border-solid rounded-full animate-spin" />
            <div className="absolute inset-3 border-t-4 border-orange-300/40 border-solid rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
          </div>
          <p className="text-white font-black uppercase tracking-widest text-xs animate-pulse">
            Initializing AR Engine...
          </p>
          <p className="text-white/30 text-xs">Loading your 3D dish experience</p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !item) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-4xl">🍽️</div>
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-black">Dish Not Found</h1>
          <p className="text-gray-500 text-sm max-w-sm">
            {error || "This dish doesn't exist or has been removed from the menu."}
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="bg-orange-600 text-white px-8 py-3 rounded-full font-black hover:bg-orange-700 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  const brandColor = profile?.brandingColor || '#ea580c';

  // ── Main AR View ──
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none">

      {/* ── model-viewer (fills entire screen) ── */}
      {/* 
        Key: suppressHydrationWarning is needed because model-viewer is a custom element
        that React doesn't know about. The element is registered by the script we load
        in useEffect above. We only render it once scriptReady and data are both available.
      */}
      {scriptReady && (
        // @ts-ignore — model-viewer is a custom web component
        <model-viewer
          ref={modelViewerRef}
          src={item.modelUrl}
          alt={item.name}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          touch-action="pan-y"
          shadow-intensity="1"
          shadow-softness="1"
          exposure="1.1"
          environment-image="neutral"
          auto-rotate
          auto-rotate-delay="2000"
          rotation-per-second="15deg"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: 'transparent',
          }}
          onLoad={() => setModelLoading(false)}
          suppressHydrationWarning
        />
      )}

      {/* ── Loading overlay while 3D model downloads ── */}
      {(modelLoading || !scriptReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 pointer-events-none">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              {!scriptReady ? 'Loading AR Engine...' : 'Downloading 3D Model...'}
            </p>
          </div>
        </div>
      )}

      {/* ── Top Overlay: Item info + AR Button ── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
        {/* Item info card */}
        <div className="pointer-events-auto bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 max-w-[200px] shadow-2xl">
          <h1 className="text-white text-base font-black truncate leading-tight">{item.name}</h1>
          <p className="font-black text-lg mt-1" style={{ color: brandColor }}>
            ${parseFloat(item.price).toFixed(2)}
          </p>
          {item.description && (
            <p className="text-white/50 text-xs mt-1 line-clamp-2 font-medium">{item.description}</p>
          )}
        </div>

        {/* AR Launch Button */}
        <button
          onClick={handleARClick}
          className="pointer-events-auto text-white px-6 py-3 rounded-2xl font-black shadow-2xl transition-all active:scale-95 hover:brightness-110 flex items-center gap-2 backdrop-blur-xl border border-white/10"
          style={{ backgroundColor: brandColor }}
        >
          <span className="text-lg">📱</span>
          <span className="text-sm">View in AR</span>
        </button>
      </div>

      {/* ── Bottom Overlay: Restaurant Branding ── */}
      {profile && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="text-center space-y-1">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.25em] block">
              AR Experience by
            </span>
            <div
              className="inline-flex items-center gap-2 bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-white/10"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                {profile.name || 'AR Food SaaS'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress bar at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 z-20">
        <div
          className="h-full transition-all duration-1000"
          style={{ backgroundColor: brandColor, width: modelLoading ? '60%' : '100%' }}
        />
      </div>

      {/* ── Back button ── */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/30 backdrop-blur-xl text-white/70 text-xs font-bold px-4 py-1.5 rounded-full border border-white/10 hover:text-white transition pointer-events-auto hidden"
        aria-hidden="true"
      >
        ← Menu
      </button>

      {/* ── Ambient gradient bg ── */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, ${brandColor}40 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
