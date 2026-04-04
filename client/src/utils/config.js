// Determines the backend base URL dynamically based on Vite's build environment.
// During local testing, it routes to Node.js localhost.
// During Production (Vercel/Github Pages), it routes to your live Render Backend URL.

const isProduction = import.meta.env.MODE === 'production';

// TODO: Replace this placeholder with your exact Render backend live URL before you run 'npm run build'
const PROD_BACKEND_URL = 'https://ar-food-viewer-backend-placeholder.onrender.com';

export const API_BASE_URL = isProduction ? PROD_BACKEND_URL : 'http://localhost:5000';
