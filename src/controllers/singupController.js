import passport from "passport";
import createHttpError from "http-errors";
import User from "../models/User.js";
import { encryptState } from "../config/cipher.js";

export const handleSignup = async (req, res, next) => {
  try {

    const userData = {
      name: req.body.name,
      email: req.body.email,
    }

    User.register(userData, req.body.password).then(() => {
      
      passport.authenticate(
        'local', 
        { session: false },
        async (err, user, info) => {
          try {
            console.log(user);
            if(err) throw createHttpError.InternalServerError(err);
            if(info) throw createHttpError.InternalServerError(info.message);

            const refreshToken = await user.generateRefreshJwt();
            const accessToken = await user.generateAccessJwt();
            const stateExpiry = 20 * 24 * 60 * 60 * 1000;
            const sessionExpiry = 25 * 60 * 1000;
  
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
                maxAge: 30 * 60 * 1000, 
              }
            )
        
            res.status(201).json({
              message: 'Hi there, Welcome to Gojou 🎉',
              userData
            });

          } catch (err) {
            console.log(err);
            next(err);
          }
        }
      )(req, res, next)

    }).catch(err => {
      if(err.name === 'UserExistsError') {
        next(createHttpError.Conflict(
          err.message.replace('username', 'email')
        ));
        return;
      }

      if(err.name === 'ValidationError') {
        next(createHttpError.BadRequest(
          err.message.replace('username', 'email')
        ));
        return;
      }

      next(createHttpError.InternalServerError(
        err.message.replace('username', 'email')
      ));
    })


  } catch (err) {
    console.log(err);
    next(err);
  }
}
