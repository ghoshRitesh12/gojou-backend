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
        
            res.status(201).json({
              userData,
              message: 'Hi there, welcome to Gojou'
            });

          } catch (err) {
            console.log(err);
            next(err);
          }
        }
      )(req, res, next)

    }).catch(err => {
      next(createHttpError.InternalServerError(err.message));
    })


  } catch (err) {
    console.log(err);
    next(err);
  }
}
