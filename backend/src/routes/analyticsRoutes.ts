import { Router } from 'express';
import {
  getSummary,
  getCompletion,
  getPomodoroStats,
  getHeatmap,
  exportReport,
} from '../controllers/analyticsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/completion', getCompletion);
router.get('/pomodoro', getPomodoroStats);
router.get('/heatmap', getHeatmap);
router.get('/export', exportReport);

export default router;
