import express from 'express';

const router = express.Router();
import { handleLogin } from '../controllers/loginController.js';

router.get('/', handleLogin)


export default router;
