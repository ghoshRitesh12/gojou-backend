import dotenv from 'dotenv';
import createHttpError from "http-errors";
import passport from "passport";
import CryptoJS from "crypto-js";
import { encryptState } from "../config/cipher.js";

dotenv.config();

const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

export const handleGoogleAuth = async (req, res, next) => {
  try {

    return passport.authenticate('google', { 
      scope: ['email', 'profile'] 
    });

  } catch (err) {
    next(err);
  }
}

export const handleGoogleAuthCallback = async (req, res, next) => {
  try {
    console.log(req.user);
    const userData = {
      name: req.user?.name,
      email: req.user?.email,
      profilePicture: req.user?.profilePicture,
    }

    // const encryptedInfo = CryptoJS.AES.encrypt(
    //   JSON.stringify(userData), process.env.FRONTEND_STATE_SECRET
    // ).toString();
    const encryptedInfo = await encryptState(
      userData, process.env.FRONTEND_STATE_SECRET
    )


    const accessToken = await req.user.generateAccessJwt();
    const refreshToken = await req.user.generateRefreshJwt();

    res.cookie(
      'refresh_token',
      refreshToken,
      { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true }
    )
    res.cookie(
      'access_token',
      accessToken,
      { httpOnly: true, maxAge: 30 * 60 * 1000, secure: true }
    )
    
    res.redirect(`${frontendBaseUrl}/auth-redirect?data=${encryptedInfo}`)

  } catch (err) {
    console.log(err);
    next(err);
  }
}
