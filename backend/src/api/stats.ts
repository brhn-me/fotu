import express from 'express';
import { statsService } from '../services/statsService';

const router = express.Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get system statistics (counts, storage)
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get('/', async (req, res) => {
    try {
        const stats = await statsService.getStats();
        // BigInt serialization fix
        const serialized = JSON.parse(JSON.stringify(stats, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        res.json(serialized);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
