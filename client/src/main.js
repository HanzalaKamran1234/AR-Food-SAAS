import './style.css';
import { subscribeToAuthChanges } from './utils/firebaseAuth.js';
import { renderLandingPage } from './pages/LandingPage.js';
import { renderAuth } from './pages/Auth.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderCheckout } from './pages/Checkout.js';

const appContainer = document.getElementById('app');

// State manager to determine which page to render
const initApp = () => {
    // Basic Hash-based router
    const handleRoute = (user) => {
        const hash = window.location.hash;
        
        if (user) {
            if (hash === '#checkout') {
                renderCheckout(appContainer);
            } else {
                // User is signed in, load Dashboard
                renderDashboard(appContainer, user);
            }
        } else {
            if (hash === '#login' || hash === '#register') {
                renderAuth(appContainer, hash === '#register');
            } else {
                renderLandingPage(appContainer);
            }
        }
    };

    // Listen to Firebase auth state
    subscribeToAuthChanges((user) => {
        handleRoute(user);
    });

    window.addEventListener('hashchange', () => {
        // Force re-auth if no user
        initApp(); 
    });

    // Fallback if Firebase is slow
    setTimeout(() => {
        if(appContainer.innerHTML.includes('Initializing Firebase...')) {
            renderLandingPage(appContainer);
        }
    }, 2000);
};

initApp();
