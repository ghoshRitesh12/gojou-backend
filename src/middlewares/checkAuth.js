import passport from "passport";
import createHttpError from "http-errors";
import { verifyJwt } from "../config/jwt.js";

const whitelist = ['/rooms/browse'];

export function checkAuth(req, res, next) {
  try {
    req.user = null;

    const refreshToken = req.cookies?.refresh_token;
    if(!refreshToken)
      throw createHttpError.Unauthorized();

    passport.authenticate(
      'access-jwt', 
      { session: false }, 
      async (err, accessDecoded, info) => {
        try {
          if(err) throw err;
          if(info) throw info;

          const refreshDecoded = await verifyJwt(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
                    
          if(accessDecoded.id !== refreshDecoded.id) 
            throw new Error('forbidden');

          req.user = {
            id: accessDecoded.id,
            email: accessDecoded.email
          }
          next(); 

        } catch (err) {
          if(whitelist.includes(req.originalUrl)) return next();
          
          console.table(err);

          if(err.message === 'forbidden') {
            next(createHttpError.Forbidden());
            return;
          }

          if(err.message.includes('token')) {
            next(createHttpError.Unauthorized());
            return;
          }

          next(createHttpError.Unauthorized(
            err.message.replace('jwt', 'session')
          ))

        }
      }
    )(req, res, next)
    
  } catch (err) {
    if(whitelist.includes(req.originalUrl)) return next();

    console.log(err.message);
    next(err);
  }
}

