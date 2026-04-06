import { getAuthToken } from '../utils/firebaseAuth.js';
import { uploadFileToStorage } from '../utils/firebaseStorage.js';
import { API_BASE_URL } from '../utils/config.js';
import { getAIOptimizationTips } from '../utils/AIAssistant.js';

export const renderRestaurantDashboard = async (container) => {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-gray-200">
                <div>
                    <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight" id="dashboardTitle">Restaurant Dashboard</h2>
                    <p class="text-gray-500 text-sm mt-1">Manage your AR menu and track performance.</p>
                </div>
                <div class="flex space-x-2 mt-4 md:mt-0">
                    <button id="openUploadModalBtn" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform active:scale-95 transition-all">
                        + Add New Item
                    </button>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                <button id="tabMenu" class="px-6 py-3 border-b-2 border-orange-600 text-orange-600 font-bold transition whitespace-nowrap">Menu Items</button>
                <button id="tabAnalytics" class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition whitespace-nowrap">Analytics</button>
                <button id="tabSettings" class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition whitespace-nowrap">Branding & Settings</button>
                <button id="tabBilling" class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition whitespace-nowrap">Subscription</button>
            </div>

            <!-- Views -->
            <div id="viewMenu" class="space-y-6">
                <div id="loadingMenu" class="text-center py-12 text-gray-500 animate-pulse">
                    Loading your delicious menu...
                </div>
                <div id="menuGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 hidden">
                    <!-- Items populated here -->
                </div>
            </div>

            <div id="viewAnalytics" class="hidden space-y-6">
                <!-- Analytics populated here -->
            </div>

            <div id="viewSettings" class="hidden space-y-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                    <h3 class="text-xl font-bold mb-4">Branding Settings</h3>
                    <form id="settingsForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Restaurant Name</label>
                            <input type="text" id="settingsName" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-orange-500 focus:border-orange-500" placeholder="Your Restaurant Name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Branding Color</label>
                            <input type="color" id="settingsColor" class="mt-1 block w-40 h-10 border border-gray-300 rounded-md p-1 shadow-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" id="settingsAddress" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-orange-500 focus:border-orange-500" placeholder="123 Street, City">
                        </div>
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md shadow transition">
                            Save Branding
                        </button>
                    </form>
                </div>
            </div>

            <div id="viewBilling" class="hidden space-y-6">
                 <div class="bg-gradient-to-r from-orange-500 to-red-600 p-8 rounded-2xl text-white shadow-xl">
                    <h3 class="text-2xl font-bold mb-2">Upgrade to Pro</h3>
                    <p class="mb-6 opacity-90">Get custom branding, unlimited items, and priority AR support.</p>
                    <ul class="space-y-2 mb-8">
                        <li class="flex items-center"><span class="mr-2">✅</span> Unlimited 3D Models</li>
                        <li class="flex items-center"><span class="mr-2">✅</span> Custom Branding & Logo</li>
                        <li class="flex items-center"><span class="mr-2">✅</span> Advanced Analytics</li>
                    </ul>
                    <button class="bg-white text-orange-600 font-extrabold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition">
                        Select Pro - $49/mo
                    </button>
                 </div>
            </div>
        </div>

        <!-- QR Modal -->
        <div id="qrModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] hidden">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <h3 class="text-xl font-bold mb-4" id="qrTitle">Food QR Code</h3>
                <div class="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                    <img id="qrImage" src="" alt="QR Code" class="w-48 h-48 mx-auto">
                </div>
                <p class="text-gray-500 text-sm mb-6">Ask customers to scan this with their phone camera to view the dish in AR.</p>
                <button id="closeQrBtn" class="w-full bg-gray-900 text-white font-bold py-2 rounded-lg">Close</button>
            </div>
        </div>


        <!-- Upload Modal overlay -->
        <div id="uploadModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-900">Add Menu Item</h3>
                    <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                
                <form id="uploadForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Food Name</label>
                        <input type="text" id="foodName" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-orange-500 focus:border-orange-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="foodDesc" rows="2" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-orange-500 focus:border-orange-500"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" step="0.01" id="foodPrice" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-orange-500 focus:border-orange-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Preview Image (JPG/PNG)</label>
                        <input type="file" id="foodImage" accept="image/*" required class="mt-1 block w-full py-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">3D Model (GLB/GLTF)</label>
                        <input type="file" id="foodModel" accept=".glb,.gltf" required class="mt-1 block w-full py-2">
                    </div>

                    <!-- AI SUGGESTIONS SECTION -->
                    <div id="aiSuggestionsContainer" class="hidden bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <div class="flex items-center space-x-2 text-blue-700 font-bold text-sm mb-2">
                             <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             <span>AI Menu Assistant Suggestions:</span>
                        </div>
                        <ul id="aiTipsList" class="text-xs text-blue-600 space-y-1 ml-6 list-disc">
                             <!-- AI Tips populated dynamically -->
                        </ul>
                    </div>

                    <div id="uploadProgressContainer" class="hidden">
                        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div id="uploadProgressBar" class="bg-orange-600 h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                        <p id="uploadProgressText" class="text-xs text-center text-gray-500">Uploading: 0%</p>
                    </div>

                    <button type="submit" id="submitItemBtn" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-all transform active:scale-95">
                        Save & Launch in AR
                    </button>
                </form>
            </div>
        </div>
    `;

    bindEvents();
    loadMenu();
};

const bindEvents = () => {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openUploadModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('uploadForm');

    // Tab buttons
    const tabs = {
        'Menu': document.getElementById('tabMenu'),
        'Analytics': document.getElementById('tabAnalytics'),
        'Settings': document.getElementById('tabSettings'),
        'Billing': document.getElementById('tabBilling')
    };
    
    // Views
    const views = {
        'Menu': document.getElementById('viewMenu'),
        'Analytics': document.getElementById('viewAnalytics'),
        'Settings': document.getElementById('viewSettings'),
        'Billing': document.getElementById('viewBilling')
    };

    const switchTab = (tabName) => {
        Object.keys(tabs).forEach(key => {
            if (key === tabName) {
                tabs[key].classList.add('border-orange-600', 'text-orange-600');
                tabs[key].classList.remove('border-transparent', 'text-gray-500');
                views[key].classList.remove('hidden');
            } else {
                tabs[key].classList.remove('border-orange-600', 'text-orange-600');
                tabs[key].classList.add('border-transparent', 'text-gray-500');
                views[key].classList.add('hidden');
            }
        });

        if (tabName === 'Analytics') loadAnalytics();
        if (tabName === 'Settings') loadSettings();
    };

    tabs.Menu.addEventListener('click', () => switchTab('Menu'));
    tabs.Analytics.addEventListener('click', () => switchTab('Analytics'));
    tabs.Settings.addEventListener('click', () => switchTab('Settings'));
    tabs.Billing.addEventListener('click', () => switchTab('Billing'));

    // AI Suggestion Trigger
    const aiContainer = document.getElementById('aiSuggestionsContainer');
    const aiList = document.getElementById('aiTipsList');
    const inputs = ['foodName', 'foodDesc', 'foodPrice'];
    
    const updateAI = () => {
        const name = document.getElementById('foodName').value;
        const desc = document.getElementById('foodDesc').value;
        const price = document.getElementById('foodPrice').value;
        
        if (name || desc || price) {
            const tips = getAIOptimizationTips(name, desc, parseFloat(price) || 0);
            aiList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
            aiContainer.classList.remove('hidden');
        } else {
            aiContainer.classList.add('hidden');
        }
    };

    inputs.forEach(id => document.getElementById(id).addEventListener('input', updateAI));

    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        updateAI();
    });

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // QR Helper
    document.getElementById('closeQrBtn').addEventListener('click', () => {
        document.getElementById('qrModal').classList.add('hidden');
    });

    // Settings Submit
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings();
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitItemBtn');
        const progressContainer = document.getElementById('uploadProgressContainer');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressText = document.getElementById('uploadProgressText');

        submitBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        progressText.innerText = "Processing files...";
        progressBar.style.width = '5%';

        try {
            const name = document.getElementById('foodName').value;
            const desc = document.getElementById('foodDesc').value;
            const price = document.getElementById('foodPrice').value;
            const imageFile = document.getElementById('foodImage').files[0];
            const modelFile = document.getElementById('foodModel').files[0];

            // 1. Upload logic via Firebase Storage wrapper
            const token = await getAuthToken(); // So we have ID
            progressText.innerText = "Uploading Image...";
            const imageUrl = await uploadFileToStorage(imageFile, `images/${Date.now()}_${imageFile.name}`, (p) => {
                 progressBar.style.width = p/2 + '%'; // Takes up 50% of the bar visual
            });

            progressText.innerText = "Uploading 3D Model...";
            const modelUrl = await uploadFileToStorage(modelFile, `models/${Date.now()}_${modelFile.name}`, (p) => {
                 progressBar.style.width = 50 + (p/2) + '%';
            });

            progressText.innerText = "Saving to Database...";
            // 2. Transmit to backend
            const response = await fetch(`${API_BASE_URL}/api/restaurant/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name, description: desc, price, imageUrl, modelUrl
                })
            });

            if (!response.ok) throw new Error("Failed to save to database");

            // Success
            modal.classList.add('hidden');
            form.reset();
            loadMenu(); // Refresh the grid

        } catch (err) {
            console.error(err);
            alert("Error creating item: " + err.message);
        } finally {
            submitBtn.disabled = false;
            progressContainer.classList.add('hidden');
            progressBar.style.width = '0%';
        }
    });
};

const loadMenu = async () => {
    const loader = document.getElementById('loadingMenu');
    const grid = document.getElementById('menuGrid');
    
    loader.classList.remove('hidden');
    grid.classList.add('hidden');
    grid.innerHTML = '';

    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/restaurant/items`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch menu");

        const data = await response.json();
        const items = data.items;

        if (items.length === 0) {
            loader.innerText = "Your menu is empty. Add an item to get started!";
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 flex flex-col transition-all group">
                <div class="h-56 bg-gray-200 relative overflow-hidden">
                    <img src="${item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : 'https://placehold.co/400x300?text=Food+Preview'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${item.name}">
                    <div class="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition"></div>
                    <div class="absolute top-4 right-4 bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-extrabold shadow-md">
                        $${item.price.toFixed(2)}
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-gray-900">${item.name}</h3>
                        <span class="text-[10px] text-orange-600 bg-orange-100 px-2 py-1 rounded-full font-black uppercase">AR Ready</span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1 mb-6 flex-grow line-clamp-2">${item.description}</p>
                    
                    <div class="grid grid-cols-2 gap-3 mt-auto">
                        <button class="qr-btn flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-bold transition" data-id="${item._id}" data-name="${item.name}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            <span>QR Code</span>
                        </button>
                        <button class="delete-item-btn flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-bold transition" data-id="${item._id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind delete
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Are you sure you want to delete this menu item?")) {
                    const id = e.currentTarget.getAttribute('data-id');
                    await deleteItem(id, token);
                    loadMenu();
                }
            });
        });

        // Bind QR
        document.querySelectorAll('.qr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const name = e.currentTarget.getAttribute('data-name');
                showQr(id, name);
            });
        });


        loader.classList.add('hidden');
        grid.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loader.innerText = "Error loading menu.";
    }
};

const showQr = (id, itemName) => {
    const qrModal = document.getElementById('qrModal');
    const qrTitle = document.getElementById('qrTitle');
    const qrImage = document.getElementById('qrImage');

    // We point the QR code to the customer view of THIS item
    // In production, this would be your deployed frontend URL
    const appBase = window.location.origin;
    const arUrl = `${appBase}/customer/ar/${id}`;
    
    qrTitle.innerText = `${itemName} - Scan to View`;
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arUrl)}`;
    
    qrModal.classList.remove('hidden');
};

const loadAnalytics = async () => {
    const container = document.getElementById('viewAnalytics');
    container.innerHTML = '<div class="text-center py-12 text-gray-500 animate-pulse">Calculating metrics...</div>';

    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/restaurant/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load analytics");
        const { analytics } = await response.json();

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p class="text-gray-500 text-sm font-medium">Total Menu Items</p>
                    <p class="text-3xl font-bold text-gray-900">${analytics.totalItems}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p class="text-gray-500 text-sm font-medium">Total Menu Views</p>
                    <p class="text-3xl font-bold text-blue-600">${analytics.totalViews}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p class="text-gray-500 text-sm font-medium">Total AR Placements</p>
                    <p class="text-3xl font-bold text-orange-600">${analytics.totalARInteractions}</p>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-6 border-b border-gray-100">
                    <h3 class="font-bold text-gray-900">Top Performing Items</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th class="px-6 py-4">Item Name</th>
                                <th class="px-6 py-4">Views</th>
                                <th class="px-6 py-4">AR Activity</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${analytics.topItems.map(item => `
                                <tr>
                                    <td class="px-6 py-4 font-medium text-gray-900">${item.name}</td>
                                    <td class="px-6 py-4">${item.views}</td>
                                    <td class="px-6 py-4">${item.arInteractions}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<div class="bg-red-50 text-red-600 p-4 rounded-lg">Error loading analytics.</div>';
    }
};

const loadSettings = async () => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/restaurant/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const { profile } = await response.json();
            document.getElementById('settingsName').value = profile.name || '';
            document.getElementById('settingsColor').value = profile.brandingColor || '#ea580c';
            document.getElementById('settingsAddress').value = profile.address || '';
            
            // Apply branding color to dashboard title
            document.getElementById('dashboardTitle').style.color = profile.brandingColor;
        }
    } catch (err) {
        console.error("Settings load error", err);
    }
};

const saveSettings = async () => {
    try {
        const name = document.getElementById('settingsName').value;
        const brandingColor = document.getElementById('settingsColor').value;
        const address = document.getElementById('settingsAddress').value;

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/restaurant/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, brandingColor, address })
        });

        if (response.ok) {
            alert("Settings saved successfully!");
            loadSettings();
        } else {
            alert("Failed to save settings.");
        }
    } catch (err) {
        console.error("Settings save error", err);
        alert("Error saving settings.");
    }
};

const deleteItem = async (id, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurant/items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) alert("Error deleting item");
    } catch(err) {
        console.error(err);
    }
};
