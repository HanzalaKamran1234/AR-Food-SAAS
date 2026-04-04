import { registerUser, loginUser } from '../utils/firebaseAuth.js';

export const renderAuth = (container) => {
    container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        AR Food Viewer SaaS
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600" id="authSubtitle">
                        Sign in to your account or create a new one
                    </p>
                </div>
                
                <form id="authForm" class="mt-8 space-y-6">
                    <div id="errorMsg" class="hidden text-red-500 text-sm text-center font-bold"></div>
                    
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email" class="sr-only">Email address</label>
                            <input id="email" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address">
                        </div>
                        <div>
                            <label for="password" class="sr-only">Password</label>
                            <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password">
                        </div>
                    </div>

                    <div id="roleSelectionContainer" class="hidden">
                        <label for="role" class="block text-sm font-medium text-gray-700">Account Type</label>
                        <select id="role" name="role" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="Customer">Customer</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <button type="submit" id="submitBtn" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-md">
                            Sign In
                        </button>
                    </div>

                    <div class="text-sm text-center">
                        <a href="#" id="toggleModeBtn" class="font-medium text-blue-600 hover:text-blue-500">
                            Don't have an account? Register here.
                        </a>
                    </div>
                </form>
            </div>
        </div>
    `;

    bindEvents();
};

let isLoginMode = true;

const bindEvents = () => {
    const form = document.getElementById('authForm');
    const toggleBtn = document.getElementById('toggleModeBtn');
    const roleContainer = document.getElementById('roleSelectionContainer');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        if(isLoginMode) {
            roleContainer.classList.add('hidden');
            submitBtn.innerText = 'Sign In';
            toggleBtn.innerText = "Don't have an account? Register here.";
        } else {
            roleContainer.classList.remove('hidden');
            submitBtn.innerText = 'Create Account';
            toggleBtn.innerText = "Already have an account? Sign in here.";
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        errorMsg.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing...';

        try {
            if (isLoginMode) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password, role);
            }
        } catch (error) {
            errorMsg.innerText = error.message || 'Authentication failed.';
            errorMsg.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = isLoginMode ? 'Sign In' : 'Create Account';
        }
    });
};
