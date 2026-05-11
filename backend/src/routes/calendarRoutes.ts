import { Router } from 'express';
import { getCalendarTasks, updateDeadline } from '../controllers/calendarController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/tasks', getCalendarTasks);
router.patch('/tasks/:id/deadline', updateDeadline);

export default router;
