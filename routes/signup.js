import { Router } from 'express';

const router = Router();
import { handleSignup } from '../controllers/singupController.js';

router.post('/', handleSignup)


export default router;
