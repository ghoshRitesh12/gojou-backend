import createHttpError from "http-errors";
import passport from "passport";
import { encryptState } from "../config/cipher.js";

export const handleLogin = async (req, res, next) => {
  try {

    passport.authenticate(
      'local', 
      { session: false },
      async (err, user, info) => {
        try {
          if(err) throw createHttpError.InternalServerError(err);
          if(info) throw createHttpError.InternalServerError(info.message);

          const refreshToken = await user.generateRefreshJwt();
          const accessToken = await user.generateAccessJwt();

          const userData = await encryptState(
            {
              name: user?.name,
              email: user?.email,
              profilePicture: user?.profilePicture
            },
            process.env.FRONTEND_STATE_SECRET
          )

          res.cookie(
            'refresh_token',
            refreshToken,
            { 
              httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, 
              secure: true,
            }
          )
          res.cookie(
            'access_token',
            accessToken,
            { httpOnly: true, maxAge: 30 * 60 * 1000, secure: true }
          )
      
          res.status(200).json({
            userData,
            message: 'Welcome back to Gojou'
          });

        } catch (err) {
          console.log(err);
          next(err);
        }
      }
    )(req, res, next)

  } catch (err) {
    console.log(err);
    next(err);
  }
}
