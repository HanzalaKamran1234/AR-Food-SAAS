'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuthToken, 
  subscribeToAuth, 
  logoutUser 
} from '@/lib/authActions';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebaseClient';
import { QRCodeSVG } from 'qrcode.react';

// Mock AI logic (porting from AIAssistant.js)
const getAITips = (name, desc, price) => {
  const tips = [];
  if (name.length < 5) tips.push("🍽️ Tip: Descriptive names like 'Golden Crispy Fries' perform better.");
  if (price > 50) tips.push("💰 Premium pricing detected. Ensure high-quality 3D textures.");
  if (desc.length < 20) tips.push("✍️ Try adding ingredients or the 'story' behind the dish.");
  tips.push("📸 Highlight: Glistening textures in 3D tend to get 30% more AR interactions.");
  return tips;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Menu');
  const [menuItems, setMenuItems] = useState([]);
  const [profile, setProfile] = useState({ name: '', brandingColor: '#ea580c', address: '' });
  const [analytics, setAnalytics] = useState(null);
  const [billingStatus, setBillingStatus] = useState('trial');
  
  // Form/Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({ id: '', name: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // New Item State
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);

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
    const token = await u.getIdToken();
    
    // Load Menu
    const menuRes = await fetch('/api/restaurant/menu', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (menuRes.ok) {
      const data = await menuRes.json();
      setMenuItems(data.items);
    }

    // Load Profile
    const profileRes = await fetch('/api/restaurant/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (profileRes.ok) {
      const data = await profileRes.json();
      setProfile(data.profile);
    }

    // Load Billing Status
    const billingRes = await fetch('/api/billing/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (billingRes.ok) {
      const data = await billingRes.json();
      setBillingStatus(data.status);
    }
  };

  const uploadToFirebase = (file, path) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => reject(error), 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await user.getIdToken();
      
      // 1. Upload files to Firebase
      const imageUrl = await uploadToFirebase(imageFile, `images/${user.uid}/${Date.now()}_img`);
      const modelUrl = await uploadToFirebase(modelFile, `models/${user.uid}/${Date.now()}_model`);

      // 2. Save Item to DB
      const res = await fetch('/api/restaurant/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newItem, imageUrl, modelUrl })
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadDashboardData(user);
        setNewItem({ name: '', description: '', price: '' });
      }
    } catch (err) {
      console.error(err);
      alert("Error adding item: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    const token = await user.getIdToken();
    const res = await fetch('/api/restaurant/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });
    if (res.ok) alert("Branding saved!");
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure?")) return;
    const token = await user.getIdToken();
    const res = await fetch(`/api/restaurant/menu?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) loadDashboardData(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <span className="text-xl font-black text-gradient">Dashboard</span>
             <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold uppercase tracking-widest">{billingStatus}</span>
          </div>
          <button 
            onClick={logoutUser}
            className="text-sm font-bold text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {['Menu', 'Analytics', 'Branding', 'Billing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === tab ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Views */}
        <div className="animate-in fade-in slide-in-from-bottom duration-500">
          {activeTab === 'Menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Your Menu</h2>
                <div className="flex space-x-3">
                  <button 
                    onClick={async () => {
                      if(confirm("This will add sample dishes to your menu. Continue?")) {
                        const res = await fetch('/api/seed');
                        const data = await res.json();
                        alert(data.message || data.error);
                        loadDashboardData(user);
                      }
                    }}
                    className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-black transition shadow-sm"
                  >
                    🌱 Seed Data
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gray-100">
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-sm">
                        ${item.price}
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setQrData({ id: item._id, name: item.name }); setIsQrModalOpen(true); }}
                        className="bg-gray-100 text-gray-900 py-3 rounded-xl text-xs font-black uppercase hover:bg-gray-200 transition"
                      >
                        QR Code
                      </button>
                      <button 
                         onClick={() => handleDeleteItem(item._id)}
                         className="bg-red-50 text-red-600 py-3 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Branding' && (
            <div className="max-w-2xl bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-2xl font-black text-gray-900">Custom Branding</h2>
              <form onSubmit={handleSaveBranding} className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Restaurant Name</label>
                    <input 
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 shadow-inner disabled:opacity-50"
                      value={profile.name}
                      disabled={billingStatus !== 'pro'}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Theme Color</label>
                    <input 
                      type="color"
                      className="w-full h-12 bg-transparent cursor-pointer disabled:opacity-50"
                      value={profile.brandingColor}
                      disabled={billingStatus !== 'pro'}
                      onChange={(e) => setProfile({...profile, brandingColor: e.target.value})}
                    />
                 </div>
                 <button 
                   type="submit"
                   disabled={billingStatus !== 'pro'}
                   className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition disabled:bg-gray-200 disabled:text-gray-400"
                 >
                   {billingStatus === 'pro' ? 'Save Branding' : '⭐ Upgrade to Pro to Change Branding'}
                 </button>
              </form>
            </div>
          )}

          {activeTab === 'Billing' && (
             <div className="max-w-3xl space-y-8">
                <div className={`p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden ${
                  billingStatus === 'pro' ? 'bg-gray-900 border-4 border-orange-500' : 'bg-gradient-to-r from-orange-500 to-red-600'
                }`}>
                   <h3 className="text-3xl font-black mb-4">
                     {billingStatus === 'pro' ? 'Pro Plan Active' : 'Level Up Your Restaurant'}
                   </h3>
                   <p className="opacity-90 max-w-lg mb-8 font-bold">
                     {billingStatus === 'pro' ? 'You have full access to branding, unlimited models, and advanced AR analytics.' : 'Lock in custom branding, remove watermarks, and get priority model optimization.'}
                   </p>
                   {billingStatus !== 'pro' && (
                      <button 
                        onClick={() => router.push('/checkout')}
                        className="bg-white text-orange-600 font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-orange-50 transition transform hover:-translate-y-1"
                      >
                         Try Pro for $49/mo
                      </button>
                   )}
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 slide-in-from-bottom duration-300">
           <div className="bg-white max-w-xl w-full rounded-3xl p-10 max-h-[90vh] overflow-y-auto space-y-8 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-900">Add New Dish</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-3xl font-black">&times;</button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Food Name</label>
                    <input 
                      required
                      className="w-full px-5 py-3 bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition font-bold"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Price ($)</label>
                    <input 
                      type="number" step="0.01" required
                      className="w-full px-5 py-3 bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition font-bold"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Preview Image</label>
                       <input type="file" required accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-xs" />
                    </div>
                    <div>
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">3D Model (GLB)</label>
                       <input type="file" required accept=".glb,.gltf" onChange={(e) => setModelFile(e.target.files[0])} className="text-xs" />
                    </div>
                 </div>

                 {/* AI Insights */}
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-xs space-y-2">
                    <p className="font-black text-orange-600 uppercase tracking-tighter flex items-center">
                       <span className="mr-2">💡</span> AI Menu Optimizer Suggestions
                    </p>
                    <ul className="text-orange-700 font-bold space-y-1">
                       {getAITips(newItem.name, newItem.description, newItem.price).map((tip, i) => (
                         <li key={i} className="animate-in fade-in slide-in-from-left duration-300 transition">{tip}</li>
                       ))}
                    </ul>
                 </div>

                 <button 
                   type="submit"
                   disabled={isUploading}
                   className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition shadow-xl transform active:scale-95 disabled:opacity-50"
                 >
                   {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Launch in AR'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* QR Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 slide-in-from-top duration-300">
           <div className="bg-white max-w-sm w-full rounded-[40px] p-10 text-center space-y-8 shadow-2xl relative">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{qrData.name}<br/><span className="text-orange-600">Scan to View</span></h3>
              <div className="p-8 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                 <QRCodeSVG 
                    value={`${window.location.origin}/ar/${qrData.id}`}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                    className="mx-auto"
                 />
              </div>
              <p className="text-xs font-bold text-gray-400 max-w-[200px] mx-auto">Customers scan this to view your dish in AR on their phone.</p>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg"
              >
                 Done
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
