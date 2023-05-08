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
          if(err) throw err; 
          if(info) throw info;

          const refreshToken = await user.generateRefreshJwt();
          const accessToken = await user.generateAccessJwt();
          const stateExpiry = 20 * 24 * 60 * 60 * 1000;
          // const stateExpiry = 40 * 1000;
          const sessionExpiry = 25 * 60 * 1000;
          // const sessionExpiry = 25 * 1000;

          const userData = await encryptState(
            {
              name: user?.name,
              email: user?.email,
              profilePicture: user?.profilePicture,
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
              maxAge: 30 * 60 * 1000
            }
          )
      
          res.status(200).json({
            message: 'Welcome back to Gojou 🤘🏻',
            userData
          });

        } catch (err) {
          console.table(err);
          next(createHttpError.Unauthorized(
            err.message.replace('username', 'email')
          ));
        }
      }
    )(req, res, next)

  } catch (err) {
    console.log(err);
    next(err);
  }
}
