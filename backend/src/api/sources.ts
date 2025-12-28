import { Router } from 'express';
import { getSources, addSource, removeSource, scanSource, toggleWatch } from '../controllers/sourcesController';

const router = Router();

/**
 * @swagger
 * /api/sources:
 *   get:
 *     summary: Get all media sources
 *     tags: [Sources]
 *     responses:
 *       200:
 *         description: List of media sources
 */
router.get('/', getSources);

/**
 * @swagger
 * /api/sources:
 *   post:
 *     summary: Add a new media source
 *     tags: [Sources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Source added successfully
 */
router.post('/', addSource);

/**
 * @swagger
 * /api/sources/{id}:
 *   delete:
 *     summary: Remove a media source
 *     tags: [Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source removed successfully
 */
router.delete('/:id', removeSource);

/**
 * @swagger
 * /api/sources/{id}/scan:
 *   post:
 *     summary: Trigger a scan for a source
 *     tags: [Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scan triggered successfully
 */
router.post('/:id/scan', scanSource);

/**
 * @swagger
 * /api/sources/{id}/toggle-watch:
 *   post:
 *     summary: Toggle directory watching for a source
 *     tags: [Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watch status toggled successfully
 */
router.post('/:id/toggle-watch', toggleWatch);

export default router;
