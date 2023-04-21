import { Router } from 'express';
import { handleLogout } from '../controllers/logoutController.js';

const router = Router();

router.get('/', handleLogout)

export default router;
