import createHttpError from "http-errors";
import passport from "passport";
import CryptoJS from "crypto-js";

export const handleGoogleAuth = async (req, res, next) => {
  try {

    return passport.authenticate('google', { 
      scope: ['email', 'profile'] 
    });

    // res.send('google auth mf');
  } catch (err) {
    next(err);
  }
}

export const handleGoogleAuthCallback = async (req, res, next) => {
  try {
    const { name, email, picture } = req.user._json;
    const userInfo = {
      name, email, profilePicture: picture
    }

    const encryptedInfo = CryptoJS.AES.encrypt(
      JSON.stringify(userInfo), process.env.AUTH_REDIRECT_SECRET
    ).toString();


    res.redirect(`http://localhost:3000/auth-redirect?data=${encryptedInfo}`)
  } catch (err) {
    next(err);
  }
}
