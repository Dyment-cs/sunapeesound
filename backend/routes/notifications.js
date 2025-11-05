const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { sendNotificationWelcome } = require('../services/email');
const { sendNotificationWelcomeSMS } = require('../services/sms');
const validator = require('validator');

/**
 * POST /api/notifications/signup
 * Sign up for notifications
 */
router.post('/signup', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            preferences
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                error: 'First name, last name, and email are required'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Check if at least one notification method is selected
        if (!preferences.notifyEmail && !preferences.notifySMS) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one notification method'
            });
        }

        // If SMS is selected, phone is required
        if (preferences.notifySMS && !phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required for SMS notifications'
            });
        }

        // Check if at least one event type is selected
        if (!preferences.typeLivestream && !preferences.typeEvents && !preferences.typeAnnouncements) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one type of notification'
            });
        }

        // Check if email already exists
        const existing = await dbGet(
            'SELECT id FROM notification_signups WHERE email = ? AND active = 1',
            [email]
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'This email is already registered for notifications'
            });
        }

        // Insert into database
        const result = await dbRun(
            `INSERT INTO notification_signups (
                first_name, last_name, email, phone,
                notify_email, notify_sms,
                type_livestream, type_events, type_announcements,
                timing, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                firstName,
                lastName,
                email,
                phone || null,
                preferences.notifyEmail ? 1 : 0,
                preferences.notifySMS ? 1 : 0,
                preferences.typeLivestream ? 1 : 0,
                preferences.typeEvents ? 1 : 0,
                preferences.typeAnnouncements ? 1 : 0,
                preferences.timing || '1hour',
                'website'
            ]
        );

        // Send welcome email
        if (preferences.notifyEmail) {
            await sendNotificationWelcome(email, firstName, preferences);
        }

        // Send welcome SMS
        if (preferences.notifySMS && phone) {
            await sendNotificationWelcomeSMS(phone, firstName);
        }

        res.json({
            success: true,
            message: 'Successfully signed up for notifications!',
            id: result.id
        });

    } catch (error) {
        console.error('Error in notification signup:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your signup'
        });
    }
});

/**
 * GET /api/notifications
 * Get all notification signups (admin only - add authentication in production)
 */
router.get('/', async (req, res) => {
    try {
        const signups = await dbAll(
            `SELECT * FROM notification_signups
             WHERE active = 1
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: signups.length,
            signups
        });
    } catch (error) {
        console.error('Error fetching notification signups:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching signups'
        });
    }
});

/**
 * DELETE /api/notifications/:email
 * Unsubscribe from notifications
 */
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const result = await dbRun(
            'UPDATE notification_signups SET active = 0 WHERE email = ?',
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
