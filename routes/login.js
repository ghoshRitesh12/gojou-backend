import { Router } from 'express';

const router = Router();
import { handleLogin } from '../controllers/loginController.js';

router.post('/', handleLogin)


export default router;
