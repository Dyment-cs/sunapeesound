const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all active videos
router.get('/', async (req, res) => {
    try {
        const videos = await dbAll(
            `SELECT id, title, youtube_url, video_id, description, category, display_order, created_at
             FROM youtube_videos
             WHERE active = 1
             ORDER BY display_order ASC, created_at DESC`
        );

        res.json({
            success: true,
            videos
        });

    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos'
        });
    }
});

// Get single video
router.get('/:id', async (req, res) => {
    try {
        const video = await dbGet(
            `SELECT * FROM youtube_videos WHERE id = ? AND active = 1`,
            [req.params.id]
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.json({
            success: true,
            video
        });

    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video'
        });
    }
});

// Add new video (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, youtube_url, description, category, display_order } = req.body;

        // Validate input
        if (!title || !youtube_url) {
            return res.status(400).json({
                success: false,
                error: 'Title and YouTube URL are required'
            });
        }

        // Extract video ID from URL
        const videoId = extractYouTubeVideoId(youtube_url);
        if (!videoId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Insert video
        const result = await dbRun(
            `INSERT INTO youtube_videos (title, youtube_url, video_id, description, category, display_order, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, youtube_url, videoId, description || '', category || 'general', display_order || 0, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Video added successfully',
            videoId: result.id
        });

    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add video'
        });
    }
});

// Update video (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, youtube_url, description, category, display_order } = req.body;

        // Check if video exists
        const existingVideo = await dbGet(
            'SELECT * FROM youtube_videos WHERE id = ?',
            [req.params.id]
        );

        if (!existingVideo) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        // Extract video ID if URL is being updated
        let videoId = existingVideo.video_id;
        if (youtube_url && youtube_url !== existingVideo.youtube_url) {
            videoId = extractYouTubeVideoId(youtube_url);
            if (!videoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid YouTube URL'
                });
            }
        }

        // Update video
        await dbRun(
            `UPDATE youtube_videos
             SET title = ?, youtube_url = ?, video_id = ?, description = ?, category = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                title || existingVideo.title,
                youtube_url || existingVideo.youtube_url,
                videoId,
                description !== undefined ? description : existingVideo.description,
                category || existingVideo.category,
                display_order !== undefined ? display_order : existingVideo.display_order,
                req.params.id
            ]
        );

        res.json({
            success: true,
            message: 'Video updated successfully'
        });

    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update video'
        });
    }
});

// Delete video (soft delete - requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await dbRun(
            'UPDATE youtube_videos SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete video'
        });
    }
});

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

module.exports = router;
