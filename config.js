// Configuration for Sunapee Sound Project
// Update the API_URL based on your environment

const CONFIG = {
    // For local development, use localhost
    // API_URL: 'http://localhost:3000/api',

    // For production, use your deployed backend URL
    // API_URL: 'https://your-backend-domain.com/api',

    // Default to localhost for now
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://api.sunapeesound.com/api'  // Update this with your production URL
};
