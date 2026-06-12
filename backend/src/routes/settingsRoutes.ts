import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { updateSettingsSchema } from '../validators/settingsValidator';
import { getSettings, updateSettings, deleteAccount } from '../controllers/settingsController';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.patch('/', validate(updateSettingsSchema), updateSettings);
router.delete('/account', deleteAccount);

export default router;
