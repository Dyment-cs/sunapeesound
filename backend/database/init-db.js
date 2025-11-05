// Script to initialize the database
const { initializeDatabase } = require('./db');

console.log('Initializing database...');
initializeDatabase();

// Keep the script running for a moment to ensure completion
setTimeout(() => {
    console.log('Database initialization complete!');
    process.exit(0);
}, 1000);
