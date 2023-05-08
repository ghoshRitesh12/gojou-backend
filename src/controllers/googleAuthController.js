import dotenv from 'dotenv';
import { encryptState } from "../config/cipher.js";
import User from '../models/User.js';

dotenv.config();

const frontendBaseUrl = process.env.FRONTEND_BASE_URL;


export const handleGoogleAuthCallback = async (req, res, next) => {
  try {

    console.log(req.user);
    const refreshToken = await req.user.generateRefreshJwt();
    const accessToken = await req.user.generateAccessJwt();
    const stateExpiry = 20 * 24 * 60 * 60 * 1000;
    const sessionExpiry = 25 * 60 * 1000;
  
    const userData = await encryptState(
      {
        name: req.user?.name,
        email: req.user?.email,
        profilePicture: req.user?.profilePicture,
        stateExpiry, sessionExpiry
      },
      process.env.FRONTEND_STATE_SECRET
    )

    res.cookie(
      'refresh_token',
      refreshToken,
      { 
        httpOnly: true, secure: true,
        maxAge: stateExpiry, 
      }
    )
    res.cookie(
      'access_token',
      accessToken,
      { 
        httpOnly: true, secure: true,
        maxAge: 30 * 60 * 1000, 
      }
    )

    res.redirect(`${frontendBaseUrl}/auth-redirect?status=200&data=${userData}`)


  } catch (err) {
    console.log(err);
    res.redirect(`${frontendBaseUrl}/auth-redirect?status=400`)
  }
}
