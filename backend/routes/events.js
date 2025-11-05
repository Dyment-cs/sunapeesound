const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');

/**
 * GET /api/events
 * Get all active events
 */
router.get('/', async (req, res) => {
    try {
        const { upcoming, limit } = req.query;
        const today = new Date().toISOString().split('T')[0];

        let query = 'SELECT * FROM events WHERE active = 1';
        let params = [];

        // Filter for upcoming events only
        if (upcoming === 'true') {
            query += ' AND date >= ?';
            params.push(today);
        }

        query += ' ORDER BY date ASC';

        // Limit results
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const events = await dbAll(query, params);

        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching events'
        });
    }
});

/**
 * GET /api/events/:id
 * Get a specific event
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const event = await dbGet(
            'SELECT * FROM events WHERE id = ? AND active = 1',
            [id]
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching event'
        });
    }
});

/**
 * POST /api/events
 * Create a new event (admin only - add authentication in production)
 */
router.post('/', async (req, res) => {
    try {
        const {
            title,
            date,
            venue,
            description,
            link,
            source,
            tags
        } = req.body;

        // Validation
        if (!title || !date) {
            return res.status(400).json({
                success: false,
                error: 'Title and date are required'
            });
        }

        // Insert into database
        const result = await dbRun(
            `INSERT INTO events (title, date, venue, description, link, source, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                date,
                venue || null,
                description || null,
                link || null,
                source || 'sunapee_sound',
                tags || null
            ]
        );

        res.json({
            success: true,
            message: 'Event created successfully',
            id: result.id
        });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while creating the event'
        });
    }
});

/**
 * PUT /api/events/:id
 * Update an event (admin only - add authentication in production)
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            date,
            venue,
            description,
            link,
            tags
        } = req.body;

        const result = await dbRun(
            `UPDATE events
             SET title = ?, date = ?, venue = ?, description = ?,
                 link = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [title, date, venue, description, link, tags, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully'
        });

    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating event'
        });
    }
});

/**
 * DELETE /api/events/:id
 * Delete an event (soft delete)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await dbRun(
            'UPDATE events SET active = 0 WHERE id = ?',
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting event'
        });
    }
});

module.exports = router;
