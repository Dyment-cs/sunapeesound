const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { sendOpenMicConfirmation } = require('../services/email');
const { sendOpenMicConfirmationSMS } = require('../services/sms');
const validator = require('validator');

/**
 * POST /api/openmic/signup
 * Sign up for open mic
 */
router.post('/signup', async (req, res) => {
    try {
        const {
            performerName,
            email,
            phone,
            timeSlot,
            performanceDetails,
            isReserve,
            signupDate
        } = req.body;

        // Validation
        if (!performerName || !email || !signupDate) {
            return res.status(400).json({
                success: false,
                error: 'Performer name, email, and signup date are required'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Check if performer already signed up for this date
        const existing = await dbGet(
            `SELECT id FROM openmic_signups
             WHERE email = ? AND signup_date = ? AND status != 'cancelled'`,
            [email, signupDate]
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'You have already signed up for this date'
            });
        }

        // Insert into database
        const result = await dbRun(
            `INSERT INTO openmic_signups (
                performer_name, email, phone, time_slot,
                performance_details, is_reserve, signup_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                performerName,
                email,
                phone || null,
                timeSlot || null,
                performanceDetails || null,
                isReserve ? 1 : 0,
                signupDate
            ]
        );

        // Send confirmation email
        await sendOpenMicConfirmation(
            email,
            performerName,
            signupDate,
            timeSlot || 'TBD',
            isReserve
        );

        // Send confirmation SMS if phone provided
        if (phone) {
            await sendOpenMicConfirmationSMS(
                phone,
                performerName,
                signupDate,
                timeSlot || 'TBD',
                isReserve
            );
        }

        res.json({
            success: true,
            message: isReserve
                ? 'Added to reserve list!'
                : 'Successfully signed up for open mic!',
            id: result.id,
            isReserve
        });

    } catch (error) {
        console.error('Error in open mic signup:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your signup'
        });
    }
});

/**
 * GET /api/openmic/schedule/:date
 * Get schedule for a specific date
 */
router.get('/schedule/:date', async (req, res) => {
    try {
        const { date } = req.params;

        const signups = await dbAll(
            `SELECT * FROM openmic_signups
             WHERE signup_date = ? AND status = 'confirmed' AND is_reserve = 0
             ORDER BY time_slot`,
            [date]
        );

        const reserveList = await dbAll(
            `SELECT * FROM openmic_signups
             WHERE signup_date = ? AND status = 'confirmed' AND is_reserve = 1
             ORDER BY created_at`,
            [date]
        );

        res.json({
            success: true,
            date,
            signups,
            reserveList
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching schedule'
        });
    }
});

/**
 * GET /api/openmic/schedule
 * Get all upcoming schedules
 */
router.get('/schedule', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const signups = await dbAll(
            `SELECT * FROM openmic_signups
             WHERE signup_date >= ? AND status = 'confirmed'
             ORDER BY signup_date, time_slot`,
            [today]
        );

        // Group by date
        const scheduleByDate = signups.reduce((acc, signup) => {
            if (!acc[signup.signup_date]) {
                acc[signup.signup_date] = {
                    regular: [],
                    reserve: []
                };
            }
            if (signup.is_reserve) {
                acc[signup.signup_date].reserve.push(signup);
            } else {
                acc[signup.signup_date].regular.push(signup);
            }
            return acc;
        }, {});

        res.json({
            success: true,
            schedule: scheduleByDate
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching schedules'
        });
    }
});

/**
 * DELETE /api/openmic/:id
 * Cancel a signup
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await dbRun(
            `UPDATE openmic_signups SET status = 'cancelled' WHERE id = ?`,
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Signup not found'
            });
        }

        res.json({
            success: true,
            message: 'Signup cancelled'
        });
    } catch (error) {
        console.error('Error cancelling signup:', error);
        res.status(500).json({
            success: false,
            error: 'Error cancelling signup'
        });
    }
});

module.exports = router;
