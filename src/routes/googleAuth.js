import { Router } from 'express';
import passport from 'passport';
import { handleGoogleAuthCallback } from '../controllers/googleAuthController.js';

const router = Router();

router.get('/', passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  })
)

router.get('/callback', 
  passport.authenticate(
    'google', 
    { 
      failureRedirect: `${process.env.FRONTEND_DEV_BASE_URL}/auth-redirect?status=400`,
      session: false
    }
  ), 
  handleGoogleAuthCallback
)


export default router;
