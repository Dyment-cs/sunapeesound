const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeDatabase } = require('./database/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// More strict rate limiting for signup endpoints
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 signups per hour
    message: 'Too many signup attempts, please try again later.'
});

// Import routes
const notificationsRouter = require('./routes/notifications');
const openmicRouter = require('./routes/openmic');
const newsletterRouter = require('./routes/newsletter');
const eventsRouter = require('./routes/events');

// API Routes
app.use('/api/notifications', notificationsRouter);
app.use('/api/openmic', openmicRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/events', eventsRouter);

// Apply signup rate limiting
app.post('/api/notifications/signup', signupLimiter);
app.post('/api/openmic/signup', signupLimiter);
app.post('/api/newsletter/signup', signupLimiter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Sunapee Sound Project API',
        version: '1.0.0',
        endpoints: {
            notifications: {
                signup: 'POST /api/notifications/signup',
                list: 'GET /api/notifications',
                unsubscribe: 'DELETE /api/notifications/:email'
            },
            openmic: {
                signup: 'POST /api/openmic/signup',
                schedule: 'GET /api/openmic/schedule',
                scheduleByDate: 'GET /api/openmic/schedule/:date',
                cancel: 'DELETE /api/openmic/:id'
            },
            newsletter: {
                signup: 'POST /api/newsletter/signup',
                list: 'GET /api/newsletter',
                unsubscribe: 'DELETE /api/newsletter/:email'
            },
            events: {
                list: 'GET /api/events',
                get: 'GET /api/events/:id',
                create: 'POST /api/events',
                update: 'PUT /api/events/:id',
                delete: 'DELETE /api/events/:id'
            }
        },
        docs: 'https://github.com/yourusername/sunapee-sound-backend'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🎵 Sunapee Sound Project API Server 🎵     ║
╠═══════════════════════════════════════════════╣
║                                               ║
║   Server running on port ${PORT}                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                               ║
║   API Endpoints:                              ║
║   - http://localhost:${PORT}/                    ║
║   - http://localhost:${PORT}/health              ║
║   - http://localhost:${PORT}/api/notifications   ║
║   - http://localhost:${PORT}/api/openmic         ║
║   - http://localhost:${PORT}/api/newsletter      ║
║   - http://localhost:${PORT}/api/events          ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
