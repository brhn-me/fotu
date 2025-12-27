import { Router } from 'express';
import { getSources, addSource, removeSource, scanSource, toggleWatch } from '../controllers/sourcesController';

const router = Router();

router.get('/', getSources);
router.post('/', addSource);
router.delete('/:id', removeSource);
router.post('/:id/scan', scanSource);
router.post('/:id/toggle-watch', toggleWatch);

export default router;
