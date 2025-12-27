import { Router } from 'express';
import prisma from '../db/client';

const router = Router();

// GET /settings - Fetch all settings as key-value pairs
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

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
        const operations = Object.entries(updates).map(([key, value]) => {
            // Ensure value is stored as string
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

            return prisma.settings.upsert({
                where: { key },
                update: { value: stringValue },
                create: { key, value: stringValue },
            });
        });

        await prisma.$transaction(operations);
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Failed to update settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
