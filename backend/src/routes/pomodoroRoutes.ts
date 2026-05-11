import { Router } from 'express';
import { startSession, endSession, getHistory } from '../controllers/pomodoroController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.post('/start', startSession);
router.patch('/:id/end', endSession);
router.get('/history', getHistory);

export default router;
