import { Router } from 'express';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const router = Router();

const BINARIES = [
    { key: 'exiftool', cmd: 'exiftool' },
    { key: 'ffmpeg', cmd: 'ffmpeg' },
    { key: 'ffprobe', cmd: 'ffprobe' },
    { key: 'darktable', cmd: 'darktable-cli' }
];

/**
 * @swagger
 * /api/runtimes:
 *   get:
 *     summary: Get status of external binaries (exiftool, ffmpeg, etc.)
 *     tags: [Runtimes]
 *     responses:
 *       200:
 *         description: List of binaries and their availability
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key: { type: string }
 *                   name: { type: string }
 *                   found: { type: boolean }
 *                   path: { type: string, nullable: true }
 */
router.get('/', async (req, res) => {
    const results = await Promise.all(BINARIES.map(async (bin) => {
        try {
            // "which" command works on Linux/macOS
            const { stdout } = await execAsync(`which ${bin.cmd}`);
            return {
                key: bin.key,
                name: bin.cmd,
                found: true,
                path: stdout.trim()
            };
        } catch (error) {
            return {
                key: bin.key,
                name: bin.cmd,
                found: false,
                path: null
            };
        }
    }));

    // Array is fine for iterating
    res.json(results);
});

/**
 * @swagger
 * /api/runtimes/verify:
 *   post:
 *     summary: Verify if a path is executable
 *     tags: [Runtimes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid: { type: boolean }
 *       400:
 *         description: Path is required
 */
router.post('/verify', async (req, res) => {
    const { path } = req.body;
    if (!path) {
        return res.status(400).json({ error: 'Path is required' });
    }

    try {
        // Check if file exists and is executable
        // "test -x" is a standard POSIX command to check executable permission
        await execAsync(`test -x "${path}"`);
        res.json({ valid: true });
    } catch (error) {
        res.json({ valid: false });
    }
});

export default router;
