import { Router } from 'express';
import {
  getSummary, getCompletion, getPomodoroStats, getHeatmap,
  exportReport, getOverdueStats, getPriorityStats,
  exportTags, exportPomodoro
} from '../controllers/analyticsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/completion', getCompletion);
router.get('/pomodoro', getPomodoroStats);
router.get('/heatmap', getHeatmap);
router.get('/export', exportReport);
router.get('/overdue', getOverdueStats);
router.get('/priority', getPriorityStats);
router.get('/export/tags', exportTags);
router.get('/export/pomodoro', exportPomodoro);
export default router;
