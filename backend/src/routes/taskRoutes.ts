import { Router } from 'express';
import {
  getTasks,
  getToday,
  getUpcoming,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  bulkAction,
  reorderTasks,
  duplicateTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Views
router.get('/today', getToday);
router.get('/upcoming', getUpcoming);

// List & create
router.get('/', getTasks);
router.post('/', createTask);

// Bulk operations (before /:id to avoid param conflict)
router.patch('/bulk', bulkAction);
router.patch('/reorder', reorderTasks);

// Single task CRUD
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/duplicate', duplicateTask);

// Subtasks
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId', updateSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

export default router;
