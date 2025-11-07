const jwt = require('jsonwebtoken');
const { dbGet } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await dbGet(
            'SELECT id, username, email, role FROM users WHERE id = ? AND active = 1',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin
};
