import { Router } from 'express';
import { settingsService } from '../services/settingsService';

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Fetch all settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: A map of setting keys and values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 */
router.get('/', async (req, res) => {
    try {
        const settingsMap = await settingsService.getAll();
        res.json(settingsMap);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update multiple settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid request body
 */
router.put('/', async (req, res) => {
    const updates = req.body; // Expects { key: value, ... }

    if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid body' });
    }

    try {
        await settingsService.update(updates);
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Failed to update settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
