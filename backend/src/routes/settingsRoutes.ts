import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { updateSettingsSchema } from '../services/settingsService';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.patch('/', validate(updateSettingsSchema), updateSettings);

export default router;
