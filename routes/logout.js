import express from 'express';

const router = express.Router();
import { handleLogout } from '../controllers/logoutController.js';

router.get('/', handleLogout)


export default router;
