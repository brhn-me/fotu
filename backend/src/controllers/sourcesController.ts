import { Request, Response } from 'express';
import { sourcesService } from '../services/sourcesService';

export const getSources = async (req: Request, res: Response) => {
    try {
        const sources = await sourcesService.getAll();
        res.json(sources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
};

export const addSource = async (req: Request, res: Response) => {
    try {
        const { path, mode } = req.body;
        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }

        const source = await sourcesService.add({
            path,
            mode: mode || 'watch'
        });
        res.json(source);
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: 'Source already exists' });
        }
        res.status(400).json({ error: error.message || 'Failed to add source' });
    }
};

export const removeSource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await sourcesService.remove(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove source' });
    }
};

export const scanSource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const source = await sourcesService.scan(id);
        res.json(source);
    } catch (error) {
        res.status(500).json({ error: 'Failed to scan source' });
    }
};

export const toggleWatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const source = await sourcesService.toggleWatch(id);
        res.json(source);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle watch' });
    }
};
