import express from 'express';
import passport from 'passport';

const router = express.Router();
import { handleGoogleAuth, handleGoogleAuthCallback } from '../controllers/googleAuthController.js';

router.get('/', 
  passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  }),
  handleGoogleAuth
)

router.get('/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/auth-failed' 
  }),
  handleGoogleAuthCallback
)

export default router;
