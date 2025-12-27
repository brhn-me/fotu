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
