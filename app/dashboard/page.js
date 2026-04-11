'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToAuth, logoutUser } from '@/lib/authActions';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebaseClient';
import { QRCodeSVG } from 'qrcode.react';

// Mock AI logic
const getAITips = (name, desc, price) => {
  const tips = [];
  if (name.length < 5) tips.push("🍽️ Descriptive names like 'Golden Crispy Fries' convert better.");
  if (parseFloat(price) > 50) tips.push("💰 Premium price detected — ensure high-quality textures in your 3D model.");
  if (desc.length < 20) tips.push("✍️ Add ingredients or the story behind this dish for better engagement.");
  tips.push("📸 Glistening textures in 3D get 30% more AR interactions on average.");
  return tips;
};

// Analytics summary card component
function StatCard({ label, value, icon, color = 'orange' }) {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-400 font-semibold mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Menu');
  const [menuItems, setMenuItems] = useState([]);
  const [profile, setProfile] = useState({ name: '', brandingColor: '#ea580c', address: '' });
  const [billingStatus, setBillingStatus] = useState('trial');
  const [pageOrigin, setPageOrigin] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({ id: '', name: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New item form state
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);

  // Branding save state
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Capture window.location.origin on client only
  useEffect(() => {
    setPageOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      if (!u) {
        router.push('/auth?m=login');
      } else {
        setUser(u);
        loadDashboardData(u);
      }
    });
    return () => unsub();
  }, []);

  const loadDashboardData = async (u) => {
    try {
      const token = await u.getIdToken();

      // Load Menu
      const menuRes = await fetch('/api/restaurant/menu', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenuItems(data.items || []);
      }

      // Load Profile
      const profileRes = await fetch('/api/restaurant/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.profile) setProfile(data.profile);
      }

      // Load Billing Status
      const billingRes = await fetch('/api/billing/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (billingRes.ok) {
        const data = await billingRes.json();
        setBillingStatus(data.status || 'trial');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  const uploadToFirebase = (file, path) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!imageFile || !modelFile) {
      setErrorMsg('Please select both an image and a 3D model file.');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');

    try {
      const token = await user.getIdToken();

      setUploadStep('Uploading preview image...');
      const imageUrl = await uploadToFirebase(imageFile, `images/${user.uid}/${Date.now()}_img`);

      setUploadStep('Uploading 3D model...');
      const modelUrl = await uploadToFirebase(modelFile, `models/${user.uid}/${Date.now()}_model`);

      setUploadStep('Saving to database...');
      const res = await fetch('/api/restaurant/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newItem, imageUrl, modelUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save item');
      }

      setIsModalOpen(false);
      setNewItem({ name: '', description: '', price: '' });
      setImageFile(null);
      setModelFile(null);
      setSuccessMsg('✅ Dish added successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadDashboardData(user);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadStep('');
      setUploadProgress(0);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setBrandingSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setBrandingSaved(true);
        setTimeout(() => setBrandingSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Remove this dish from your menu?')) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/restaurant/menu?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((i) => i._id !== id));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics computed from menu items
  const totalViews = menuItems.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalAR = menuItems.reduce((sum, item) => sum + (item.arInteractions || 0), 0);
  const topItem = menuItems.slice().sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0];

  const tabs = ['Menu', 'Analytics', 'Branding', 'Billing'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-gradient">AR Food SaaS</span>
            <span
              className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                billingStatus === 'pro'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {billingStatus}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-xs text-gray-400 font-semibold hidden sm:block truncate max-w-[200px]">
                {user.email}
              </span>
            )}
            <button
              onClick={logoutUser}
              className="text-sm font-bold text-gray-400 hover:text-red-600 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 font-bold text-sm">
            {successMsg}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 pb-3 pt-1 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════════════ MENU TAB ══════════════════════ */}
        {activeTab === 'Menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Your AR Menu</h2>
                <p className="text-sm text-gray-400 mt-1">{menuItems.length} dish{menuItems.length !== 1 ? 'es' : ''} · Scan QR codes to view in 3D</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={async () => {
                    if (confirm('Seed sample dishes to your menu? (Existing items will be cleared)')) {
                      const res = await fetch('/api/seed');
                      const data = await res.json();
                      alert(data.message || data.error);
                      loadDashboardData(user);
                    }
                  }}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-black transition shadow-sm"
                >
                  🌱 Seed Demo Data
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Add Dish
                </button>
              </div>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="text-6xl">🍽️</div>
                <h3 className="text-xl font-black text-gray-700">No dishes yet</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  Add your first dish or seed demo data to see how the AR menu experience works.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black hover:bg-orange-700 transition"
                >
                  + Add Your First Dish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  >
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400'; }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-sm">
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span>👁</span> {item.viewCount || 0}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-black text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-4">{item.description || 'No description.'}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setQrData({ id: item._id, name: item.name });
                            setIsQrModalOpen(true);
                          }}
                          className="bg-gray-50 border border-gray-200 text-gray-800 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
                        >
                          <span>🔲</span> QR Code
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="bg-red-50 border border-red-100 text-red-600 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════ ANALYTICS TAB ══════════════════════ */}
        {activeTab === 'Analytics' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Analytics Overview</h2>
              <p className="text-sm text-gray-400 mt-1">Track how customers interact with your AR menu</p>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">📊</div>
                <p className="text-gray-500 font-bold">No data yet. Add dishes and get customer scans!</p>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Dishes" value={menuItems.length} icon="🍽️" color="orange" />
                  <StatCard label="Total AR Views" value={totalViews} icon="👁️" color="blue" />
                  <StatCard label="AR Interactions" value={totalAR} icon="📱" color="purple" />
                  <StatCard label="Avg. Views/Dish" value={menuItems.length ? Math.round(totalViews / menuItems.length) : 0} icon="📈" color="green" />
                </div>

                {/* Top Performer */}
                {topItem && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-3">⭐ Top Performing Dish</p>
                    <div className="flex items-center gap-4">
                      <img
                        src={topItem.imageUrl}
                        alt={topItem.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div>
                        <h3 className="text-2xl font-black">{topItem.name}</h3>
                        <p className="opacity-80 text-sm font-semibold">{topItem.viewCount || 0} views · {topItem.arInteractions || 0} AR interactions</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Per-item breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-black text-gray-900">Per-Dish Breakdown</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {menuItems
                      .slice()
                      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                      .map((item) => {
                        const maxViews = Math.max(...menuItems.map((i) => i.viewCount || 0), 1);
                        const pct = ((item.viewCount || 0) / maxViews) * 100;
                        return (
                          <div key={item._id} className="px-6 py-4 flex items-center gap-4">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="flex-grow min-w-0">
                              <p className="font-black text-sm text-gray-900 truncate">{item.name}</p>
                              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-black text-gray-900">{item.viewCount || 0}</p>
                              <p className="text-[10px] text-gray-400">views</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════ BRANDING TAB ══════════════════════ */}
        {activeTab === 'Branding' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Custom Branding</h2>
              <p className="text-sm text-gray-400 mt-1">
                {billingStatus !== 'pro' ? '⭐ Pro plan required to save custom branding.' : 'Your brand, your AR experience.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <form onSubmit={handleSaveBranding} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Restaurant Name
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                    value={profile.name || ''}
                    disabled={billingStatus !== 'pro'}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="The Golden Bistro"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Address
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                    value={profile.address || ''}
                    disabled={billingStatus !== 'pro'}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Foodie Lane, San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Brand Color — AR Accent
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      value={profile.brandingColor || '#ea580c'}
                      disabled={billingStatus !== 'pro'}
                      onChange={(e) => setProfile({ ...profile, brandingColor: e.target.value })}
                    />
                    <div>
                      <p className="font-black text-gray-900 text-sm">{profile.brandingColor || '#ea580c'}</p>
                      <p className="text-xs text-gray-400">Shown in AR overlay and QR badge</p>
                    </div>
                  </div>
                </div>

                {brandingSaved && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-bold">
                    ✅ Branding saved!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={billingStatus !== 'pro' || brandingSaving}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {brandingSaving
                    ? 'Saving...'
                    : billingStatus === 'pro'
                    ? 'Save Branding'
                    : '⭐ Upgrade to Pro to Unlock Branding'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════ BILLING TAB ══════════════════════ */}
        {activeTab === 'Billing' && (
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Subscription & Billing</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your plan</p>
            </div>

            <div
              className={`p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden ${
                billingStatus === 'pro'
                  ? 'bg-gray-900 border-4 border-orange-500'
                  : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600'
              }`}
            >
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/5 rounded-full" />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-3">
                  {billingStatus === 'pro' ? '✓ Active Plan' : 'Current Plan'}
                </p>
                <h3 className="text-4xl font-black mb-3">
                  {billingStatus === 'pro' ? 'Pro Plan' : 'Free Trial'}
                </h3>
                <p className="opacity-80 max-w-lg mb-8 font-semibold text-sm leading-relaxed">
                  {billingStatus === 'pro'
                    ? 'You have full access to custom branding, unlimited AR items, and advanced analytics.'
                    : 'Unlock custom branding, remove watermarks, and get priority 3D model optimization. Upgrade to Pro now.'}
                </p>

                {billingStatus !== 'pro' && (
                  <button
                    onClick={() => router.push('/checkout')}
                    className="bg-white text-orange-600 font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-orange-50 transition transform hover:-translate-y-1 active:scale-95"
                  >
                    Upgrade to Pro — $49/mo
                  </button>
                )}
              </div>
            </div>

            {/* Plan features comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Free Trial', price: '$0', features: ['Up to 5 AR Items', 'Basic Analytics', 'Standard QR Codes', 'AR 3D Viewer'], disabled: ['Custom Branding', 'Priority Support'] },
                { title: 'Pro Plan', price: '$49/mo', features: ['Unlimited AR Items', 'Advanced Analytics', 'Custom Branding & Colors', 'Priority 3D Optimization', 'Remove Watermarks', 'Priority Support'], disabled: [] },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className={`bg-white rounded-3xl p-8 border shadow-sm ${plan.title === 'Pro Plan' && billingStatus === 'pro' ? 'border-orange-500 border-2' : 'border-gray-100'}`}
                >
                  <h4 className="text-lg font-black text-gray-900 mb-1">{plan.title}</h4>
                  <p className="text-3xl font-black text-orange-600 mb-6">{plan.price}</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                    {plan.disabled.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
                        <span className="text-gray-300">✗</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════ ADD ITEM MODAL ══════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">Add New Dish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-500 font-black"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-bold mb-6">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Dish Name *
                </label>
                <input
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition font-bold text-gray-900"
                  placeholder="e.g. Gourmet Truffle Burger"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition font-bold text-gray-900"
                  placeholder="e.g. 18.99"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition font-semibold text-gray-900 resize-none"
                  placeholder="Ingredients, story, or what makes this dish special..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Preview Image * (JPG, PNG, WebP)
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 file:cursor-pointer"
                  />
                  {imageFile && <p className="text-xs text-green-600 font-bold mt-2">✓ {imageFile.name}</p>}
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-orange-400 transition">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    3D Model * (.GLB / .GLTF)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".glb,.gltf"
                    onChange={(e) => setModelFile(e.target.files[0])}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 file:cursor-pointer"
                  />
                  {modelFile && <p className="text-xs text-green-600 font-bold mt-2">✓ {modelFile.name}</p>}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <p className="font-black text-orange-600 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>💡</span> AI Menu Optimizer
                </p>
                <ul className="text-orange-700 font-semibold space-y-1.5 text-xs">
                  {getAITips(newItem.name, newItem.description, newItem.price).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{uploadStep}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-base hover:bg-orange-700 transition shadow-xl shadow-orange-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : '🚀 Launch in AR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════ QR CODE MODAL ══════════════════════ */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
          <div className="bg-white max-w-sm w-full rounded-[32px] p-8 text-center space-y-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-black text-gray-900">{qrData.name}</h3>
              <p className="text-orange-600 font-black text-sm mt-1">Scan to View in AR</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 inline-block w-full">
              {pageOrigin ? (
                <QRCodeSVG
                  value={`${pageOrigin}/ar/${qrData.id}`}
                  size={200}
                  level="H"
                  includeMargin
                  className="mx-auto"
                  fgColor="#111111"
                />
              ) : (
                <div className="w-[200px] h-[200px] mx-auto bg-gray-200 animate-pulse rounded-xl" />
              )}
            </div>

            {pageOrigin && (
              <p className="text-[10px] text-gray-400 font-mono break-all bg-gray-50 rounded-xl px-4 py-2">
                {pageOrigin}/ar/{qrData.id}
              </p>
            )}

            <p className="text-xs font-semibold text-gray-400 max-w-[200px] mx-auto">
              Customers scan this to view your dish in 3D AR on their phone — no app needed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (pageOrigin) {
                    navigator.clipboard.writeText(`${pageOrigin}/ar/${qrData.id}`);
                    alert('Link copied!');
                  }
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition"
              >
                Copy Link
              </button>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-black transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
