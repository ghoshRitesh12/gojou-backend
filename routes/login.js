import { Router } from 'express';
import { handleLogin } from '../controllers/loginController.js';
import alreadyLoggedIn from '../middlewares/alreadyLoggedIn.js';

const router = Router();

router.post('/', alreadyLoggedIn, handleLogin)

export default router;
