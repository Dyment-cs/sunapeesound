const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { sendNewsletterWelcome } = require('../services/email');
const validator = require('validator');

/**
 * POST /api/newsletter/signup
 * Sign up for newsletter
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Check if email already exists
        const existing = await dbGet(
            'SELECT id FROM newsletter_signups WHERE email = ? AND active = 1',
            [email]
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'This email is already subscribed to the newsletter'
            });
        }

        // Insert into database
        const result = await dbRun(
            'INSERT INTO newsletter_signups (name, email) VALUES (?, ?)',
            [name, email]
        );

        // Send welcome email
        await sendNewsletterWelcome(email, name);

        res.json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            id: result.id
        });

    } catch (error) {
        console.error('Error in newsletter signup:', error);

        // Handle unique constraint error
        if (error.message && error.message.includes('UNIQUE constraint')) {
            return res.status(400).json({
                success: false,
                error: 'This email is already subscribed to the newsletter'
            });
        }

        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your signup'
        });
    }
});

/**
 * GET /api/newsletter
 * Get all newsletter subscribers (admin only - add authentication in production)
 */
router.get('/', async (req, res) => {
    try {
        const subscribers = await dbAll(
            `SELECT * FROM newsletter_signups
             WHERE active = 1
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: subscribers.length,
            subscribers
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching subscribers'
        });
    }
});

/**
 * DELETE /api/newsletter/:email
 * Unsubscribe from newsletter
 */
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const result = await dbRun(
            'UPDATE newsletter_signups SET active = 0 WHERE email = ?',
            [email]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        res.json({
            success: true,
            message: 'Successfully unsubscribed'
        });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing unsubscribe'
        });
    }
});

module.exports = router;
