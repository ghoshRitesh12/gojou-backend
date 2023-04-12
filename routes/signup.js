import express from 'express';

const router = express.Router();
import { handleSignup } from '../controllers/singupController.js';

router.get('/', handleSignup)


export default router;
