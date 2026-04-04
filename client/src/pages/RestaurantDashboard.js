import { getAuthToken } from '../utils/firebaseAuth.js';
import { uploadFileToStorage } from '../utils/firebaseStorage.js';
import { API_BASE_URL } from '../utils/config.js';

export const renderRestaurantDashboard = async (container) => {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Your Menu</h2>
                <button id="openUploadModalBtn" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-md shadow transition">
                    + Add New Item
                </button>
            </div>

            <div id="loadingMenu" class="text-center py-12 text-gray-500 animate-pulse">
                Loading your delicious menu...
            </div>

            <div id="menuGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
                <!-- Items populated here -->
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

                    <div id="uploadProgressContainer" class="hidden">
                        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div id="uploadProgressBar" class="bg-orange-600 h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                        <p id="uploadProgressText" class="text-xs text-center text-gray-500">Uploading: 0%</p>
                    </div>

                    <button type="submit" id="submitItemBtn" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition">
                        Save Item
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

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

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
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
                <div class="h-48 bg-gray-200 relative overflow-hidden">
                    <!-- The actual preview image goes here -->
                    <img src="${item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : 'https://placehold.co/400x300?text=Food+Preview'}" class="w-full h-full object-cover" alt="${item.name}">
                    <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                        $${item.price.toFixed(2)}
                    </div>
                </div>
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-500 mt-1 mb-4 flex-grow">${item.description}</p>
                    <div class="flex justify-between items-center mt-auto">
                        <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded font-bold uppercase">AR Ready</span>
                        <button class="delete-item-btn text-xs text-red-500 hover:text-red-700 p-2" data-id="${item._id}">
                            Delete
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

        loader.classList.add('hidden');
        grid.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loader.innerText = "Error loading menu.";
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
