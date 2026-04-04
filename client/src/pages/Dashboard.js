import { logoutUser, getAuthToken } from '../utils/firebaseAuth.js';
import { renderAdminDashboard } from './AdminDashboard.js';
import { renderRestaurantDashboard } from './RestaurantDashboard.js';
import { renderCustomerDashboard } from './CustomerDashboard.js';
import { API_BASE_URL } from '../utils/config.js';

export const renderDashboard = async (container, user) => {
    // Show loading state
    container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
            <p class="text-xl font-bold text-gray-500 animate-pulse">Loading secure dashboard...</p>
        </div>
    `;
    
    // Fetch Role from our backend
    let userDetails = { role: 'Loading...' };
    try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if(res.ok) {
            const data = await res.json();
            userDetails = data.user;
        } else {
            console.error("Failed to fetch user details from backend");
        }
    } catch(err) {
        console.error(err);
    }

    container.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex flex-col">
            <nav class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AR Food Viewer</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm font-medium text-gray-600">${user.email}</span>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${getRoleGradient(userDetails.role)}">
                                ${userDetails.role}
                            </span>
                            <button id="logoutBtn" class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main class="w-full flex-grow mx-auto py-8 px-4 sm:px-6 lg:px-8 flex p-0">
                <div class="max-w-7xl mx-auto w-full">
                    <div id="roleWorkspaceContainer" class="w-full">
                        <div class="text-center text-gray-500 animate-pulse">Loading workspace...</div>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Render the specific Workspace UI based on Role
    const workspaceContainer = document.getElementById('roleWorkspaceContainer');
    
    if (userDetails.role === 'Admin') {
        renderAdminDashboard(workspaceContainer);
    } else if (userDetails.role === 'Restaurant') {
        renderRestaurantDashboard(workspaceContainer);
    } else {
        renderCustomerDashboard(workspaceContainer);
    }

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error(e);
        }
    });
};

const getRoleGradient = (role) => {
    switch(role) {
        case 'Admin': return 'from-purple-500 to-indigo-500';
        case 'Restaurant': return 'from-orange-500 to-red-500';
        default: return 'from-green-400 to-blue-500';
    }
};
