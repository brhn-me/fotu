import express from 'express';
import { JOBS_CONFIG } from '../config/jobsConfig';
import { getQueue } from '../lib/queue';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get status of all job queues
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of job queues with status
 */
router.get('/', async (req, res) => {
    try {
        const statuses = await Promise.all(
            Object.values(JOBS_CONFIG).map(async (jobConfig) => {
                const queue = getQueue(jobConfig.id as any);
                if (!queue) return null;

                const counts = await queue.getJobCounts('active', 'completed', 'failed', 'delayed', 'waiting', 'paused');
                const isPaused = await queue.isPaused();

                return {
                    id: jobConfig.id,
                    title: jobConfig.title,
                    description: jobConfig.description,
                    counts,
                    isPaused
                };
            })
        );

        res.json(statuses.filter(Boolean));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/jobs/config:
 *   get:
 *     summary: Get job configurations
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job configuration data
 */
router.get('/config', (req, res) => {
    res.json(JOBS_CONFIG);
});

/**
 * @swagger
 * /api/jobs/{id}/action:
 *   post:
 *     summary: Perform an action on a job queue
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID (queue name)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [start, pause, resume, stop, drain]
 *     responses:
 *       200:
 *         description: Action performed successfully
 *       404:
 *         description: Job queue not found
 *       500:
 *         description: Server error
 */
router.post('/:id/action', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'start', 'pause', 'resume', 'stop'

    const queue = getQueue(id as any);
    if (!queue) {
        return res.status(404).json({ error: 'Job queue not found' });
    }

    try {
        if (action === 'pause') {
            await queue.pause();
        } else if (action === 'resume') {
            await queue.resume();
        } else if (action === 'drain') {
            await queue.drain();
        }

        res.json({ success: true, action });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
