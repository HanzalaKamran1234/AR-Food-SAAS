import { getAuthToken } from '../utils/firebaseAuth.js';
import { API_BASE_URL } from '../utils/config.js';

export const renderAdminDashboard = async (container) => {
    container.innerHTML = `
        <div class="space-y-6 w-full">
            <div class="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Platform Users</h3>
                    <p class="mt-1 text-sm text-gray-500">Manage all customers, restaurants, and fellow admins.</p>
                </div>
                <button id="refreshUsersBtn" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                     Refresh List
                </button>
            </div>

            <div class="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                <ul id="usersList" class="divide-y divide-gray-200">
                    <li class="p-6 text-center text-gray-500 animate-pulse">Loading users...</li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsers());

    // Initially load the users
    await loadUsers();
};

const loadUsers = async () => {
    const listContainer = document.getElementById('usersList');
    listContainer.innerHTML = `<li class="p-6 text-center text-gray-500 animate-pulse">Loading users...</li>`;
    
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        const users = data.users;

        if (users.length === 0) {
            listContainer.innerHTML = `<li class="p-6 text-center text-gray-500">No users found.</li>`;
            return;
        }

        listContainer.innerHTML = users.map(user => `
            <li class="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-blue-600 truncate">${user.email}</span>
                    <span class="text-xs text-gray-400 mt-1">Joined: ${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}">
                        ${user.role}
                    </span>
                    <button class="delete-user-btn text-red-600 hover:text-red-900 transition-colors bg-red-50 hover:bg-red-100 p-2 rounded-full cursor-pointer" data-id="${user._id}" title="Delete User">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </li>
        `).join('');

        // Bind delete events
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) {
                    await deleteUser(userId, token);
                    loadUsers(); // Refresh list after deletion
                }
            });
        });

    } catch (err) {
        console.error(err);
        listContainer.innerHTML = `<li class="p-6 text-center text-red-500">Error loading users. Make sure backend is running.</li>`;
    }
};

const getRoleBadgeColor = (role) => {
    switch(role) {
        case 'Admin': return 'bg-purple-100 text-purple-800';
        case 'Restaurant': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const deleteUser = async (id, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errData = await response.json();
            alert(`Error deleting user: ${errData.message}`);
        }
    } catch(err) {
        console.error("Delete request failed", err);
        alert('Network error while deleting user.');
    }
};
