import { Router } from 'express';
import { handleSignup } from '../controllers/singupController.js';
import alreadyLoggedIn from '../middlewares/alreadyLoggedIn.js';

const router = Router();

router.post('/', alreadyLoggedIn, handleSignup)

export default router;
