import { getAuthToken } from '../utils/firebaseAuth.js';
import { API_BASE_URL } from '../utils/config.js';

let cart = []; // Local cart state

export const renderCustomerDashboard = async (container) => {
    container.innerHTML = `
        <div class="relative min-h-screen pb-20">
            <!-- Floating Cart Widget -->
            <div id="cartWidget" class="fixed top-20 right-8 bg-white p-4 rounded-xl shadow-xl border border-gray-200 z-40 w-80 hidden">
                <div class="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 class="font-bold text-gray-800 text-lg">Your Cart</h3>
                    <span id="cartCount" class="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">0</span>
                </div>
                <div id="cartItems" class="max-h-60 overflow-y-auto space-y-2 mb-4">
                    <p class="text-gray-400 text-sm italic">Cart is empty.</p>
                </div>
                <div class="border-t pt-2 flex justify-between items-center mb-4">
                    <span class="font-bold text-gray-700">Total:</span>
                    <span id="cartTotal" class="font-bold text-gray-900">$0.00</span>
                </div>
                <button class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded shadow transition">
                    Checkout Placehoder
                </button>
            </div>

            <div id="viewContainer" class="space-y-6">
                <!-- Views get injected here -->
            </div>
            
            <!-- AR Modal Placeholder (Phase 6) -->
            <div id="arModalPlaceholder" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 hidden">
                <div class="text-center space-y-4">
                    <p class="text-white text-2xl font-bold animate-pulse">Launching AR Interface...</p>
                    <p class="text-gray-400">Loading 3D Model data for <span id="arTargetName" class="text-blue-400"></span></p>
                    <button id="closeArBtn" class="mt-8 px-6 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800 transition">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('closeArBtn').addEventListener('click', () => {
        document.getElementById('arModalPlaceholder').classList.add('hidden');
    });

    await renderRestaurantList();
};

const renderRestaurantList = async () => {
    const view = document.getElementById('viewContainer');
    view.innerHTML = `<div class="text-center py-12 text-gray-500 animate-pulse">Finding nearby restaurants...</div>`;

    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/customer/restaurants`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const restaurants = data.restaurants;

        view.innerHTML = `
            <div>
                <h2 class="text-3xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Discover Restaurants</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${restaurants.map(r => `
                        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition hover:-translate-y-1 hover:shadow-xl cursor-pointer restaurant-card" data-id="${r._id}">
                            <div class="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-4 flex items-center justify-center">
                                <svg class="h-12 w-12 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 break-words">${r.email.split('@')[0]} Bakery/Grill</h3>
                            <p class="text-sm text-gray-500 mt-2">Click to view 3D Menu</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.querySelectorAll('.restaurant-card').forEach(card => {
            card.addEventListener('click', (e) => {
                renderMenu(e.currentTarget.getAttribute('data-id'));
            });
        });

    } catch(err) {
        console.error(err);
        view.innerHTML = `<div class="text-center py-12 text-red-500">Error loading restaurants.</div>`;
    }
};

const renderMenu = async (restaurantId) => {
    const view = document.getElementById('viewContainer');
    view.innerHTML = `<div class="text-center py-12 text-gray-500 animate-pulse">Loading menu...</div>`;

    document.getElementById('cartWidget').classList.remove('hidden'); // Show cart when browsing a menu

    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/customer/restaurants/${restaurantId}/items`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch menu");

        const data = await response.json();
        const items = data.items;

        view.innerHTML = `
            <div>
                <button id="backBtn" class="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Restaurants
                </button>
                <h2 class="text-3xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">Menu for ${data.restaurant.email.split('@')[0]}</h2>
                
                ${items.length === 0 ? '<p class="text-gray-500">This restaurant has not added any items yet.</p>' : ''}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${items.map(item => `
                        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-shadow">
                            <div class="md:w-2/5 h-48 md:h-auto relative overflow-hidden bg-gray-100">
                                <img src="${item.imageUrl}" class="w-full h-full object-cover transform transition group-hover:scale-105" alt="${item.name}">
                                <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button class="ar-launch-btn bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 font-bold py-2 px-4 rounded-full shadow-lg transform transition hover:scale-105 flex items-center" 
                                        data-modelurl="${item.modelUrl}" data-name="${item.name}">
                                        <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                        View in AR
                                    </button>
                                </div>
                            </div>
                            <div class="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div class="flex justify-between items-start">
                                        <h3 class="text-xl font-bold text-gray-900">${item.name}</h3>
                                        <span class="text-lg font-extrabold text-green-600">$${item.price.toFixed(2)}</span>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-2">${item.description}</p>
                                </div>
                                <button class="add-to-cart-btn w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors border border-blue-200" 
                                    data-name="${item.name}" data-price="${item.price}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('backBtn').addEventListener('click', () => {
            document.getElementById('cartWidget').classList.add('hidden');
            renderRestaurantList();
        });

        // Add Multiplayer session input globally above the items
        const menuHeader = document.querySelector('h2.text-3xl');
        if (menuHeader) {
            const multiplayerControls = document.createElement('div');
            multiplayerControls.className = 'mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center space-x-4';
            multiplayerControls.innerHTML = `
                <div class="flex-grow">
                    <h4 class="font-bold text-indigo-900">Multiplayer AR</h4>
                    <p class="text-sm text-indigo-700">Join a friend's session to view the same food together.</p>
                </div>
                <input type="text" id="joinSessionId" placeholder="Enter Room Code" class="border border-indigo-200 rounded px-3 py-2 w-40 text-sm focus:outline-none focus:ring focus:ring-indigo-300">
            `;
            menuHeader.parentNode.insertBefore(multiplayerControls, menuHeader.nextSibling);
        }

        // AR Button Logic
        document.querySelectorAll('.ar-launch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modelUrl = e.currentTarget.getAttribute('data-modelurl');
                
                // Determine session ID
                const manualInput = document.getElementById('joinSessionId');
                let sessionId = manualInput && manualInput.value.trim() ? manualInput.value.trim() : null;
                
                if (!sessionId) {
                    // Generate a new one
                    sessionId = Math.random().toString(36).substr(2, 5).toUpperCase();
                    alert(`Your Multiplayer AR Room Code is: ${sessionId}\n\nShare this with a friend!`);
                }

                console.log(`[Phase 6/9] Launching AR Engine. URL: ${modelUrl} | Room: ${sessionId}`);
                
                // Dynamically import to save client bundle weight until needed
                import('../ar/ARManager.js').then(module => {
                    module.launchAR(modelUrl, sessionId);
                }).catch(err => {
                    console.error("Failed to load AR Engine", err);
                    alert("This device cannot load the AR Engine.");
                });
            });
        });

        // Cart Logic
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.currentTarget.getAttribute('data-name');
                const price = parseFloat(e.currentTarget.getAttribute('data-price'));
                
                cart.push({ name, price });
                updateCartUI();
                
                // Visual feedback
                const origText = e.currentTarget.innerText;
                e.currentTarget.innerText = "Added!";
                e.currentTarget.classList.add('bg-blue-600', 'text-white');
                setTimeout(() => {
                    e.currentTarget.innerText = origText;
                    e.currentTarget.classList.remove('bg-blue-600', 'text-white');
                }, 1000);
            });
        });

    } catch(err) {
        console.error(err);
        view.innerHTML = `<div class="text-center py-12 text-red-500">Error loading menu.</div>`;
    }
};

const updateCartUI = () => {
    const list = document.getElementById('cartItems');
    const count = document.getElementById('cartCount');
    const total = document.getElementById('cartTotal');

    count.innerText = cart.length;

    if(cart.length === 0) {
        list.innerHTML = `<p class="text-gray-400 text-sm italic">Cart is empty.</p>`;
        total.innerText = '$0.00';
        return;
    }

    let sum = 0;
    list.innerHTML = cart.map((item, index) => {
        sum += item.price;
        return `
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-1">
                <span class="text-gray-800 font-medium truncate w-32" title="${item.name}">${item.name}</span>
                <span class="text-gray-600 font-bold">$${item.price.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    total.innerText = `$${sum.toFixed(2)}`;
};
