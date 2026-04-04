import './style.css';
import { subscribeToAuthChanges } from './utils/firebaseAuth.js';
import { renderAuth } from './pages/Auth.js';
import { renderDashboard } from './pages/Dashboard.js';

const appContainer = document.getElementById('app');

// State manager to determine which page to render
const initApp = () => {
    appContainer.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <span class="text-2xl font-bold text-blue-500 animate-bounce">Initializing Firebase...</span>
        </div>
    `;

    // Listen to Firebase auth state
    // Note: Due to placeholder credentials, this might not trigger perfectly, 
    // but the logic is production-ready for when credentials are added.
    subscribeToAuthChanges((user) => {
        if (user) {
            // User is signed in, load Dashboard
            renderDashboard(appContainer, user);
        } else {
            // No user is signed in, load Auth forms
            renderAuth(appContainer);
        }
    });

    // Fallback if Firebase is not configured at all (to prevent blank screen)
    setTimeout(() => {
        if(appContainer.innerHTML.includes('Initializing Firebase...')) {
            console.warn("Auth initialization took too long. Likely missing credentials. Rendering Auth UI fallback.");
            renderAuth(appContainer);
        }
    }, 2000);
};

initApp();
