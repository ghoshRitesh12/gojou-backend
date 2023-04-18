import { Router } from 'express';
import passport from 'passport';

const router = Router();
import { handleGoogleAuth, handleGoogleAuthCallback } from '../controllers/googleAuthController.js';

router.get('/', 
  passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  }),
  handleGoogleAuth
)

router.get('/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_BASE_URL}/auth-redirect?data=error`,
    session: false
  }),
  handleGoogleAuthCallback
)

export default router;
