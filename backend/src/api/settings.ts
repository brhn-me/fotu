import { Router } from 'express';
import { settingsService } from '../services/settingsService';

const router = Router();

// GET /settings - Fetch all settings as key-value pairs
router.get('/', async (req, res) => {
    try {
        const settingsMap = await settingsService.getAll();
        res.json(settingsMap);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /settings - Update multiple settings
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
