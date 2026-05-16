import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createTagSchema, updateTagSchema } from '../services/tagService';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';

const router = Router();

router.use(authenticate);

router.get('/', getTags);
router.post('/', validate(createTagSchema), createTag);
router.patch('/:id', validate(updateTagSchema), updateTag);
router.delete('/:id', deleteTag);

export default router;
