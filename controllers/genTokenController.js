import passport from "passport";
import createHttpError from "http-errors";
import { signJwt } from "../config/jwt.js";

export const handleTokenGen = async (req, res, next) => {
  try {
    const accessCookie = req.cookies?.access_token;
    if(accessCookie) 
      throw createHttpError.BadRequest('session alive');

    passport.authenticate(
      'refresh-jwt', 
      { session: false }, 
      async (err, refreshDecoded, info) => {
        try {
          if(err) throw err;
          if(info) throw info;

          const newAccessToken = await signJwt(
            { id: refreshDecoded.id, email: refreshDecoded.email },
            process.env.ACCESS_TOKEN_SECRET,
            '30m'
          );

          const newRefreshToken = await signJwt(
            { id: refreshDecoded.id, email: refreshDecoded.email },
            process.env.REFRESH_TOKEN_SECRET,
            '20d'
          );

          // const stateExpiry = 20 * 24 * 60 * 60 * 1000;
          const stateExpiry = 20 * 24 * 60 * 60 * 1000;
          // const sessionExpiry = 25 * 60 * 1000;
          const sessionExpiry = 25 * 1000;

          res.cookie(
            'access_token',
            newAccessToken,
            {
              httpOnly: true, secure: true,
              maxAge: 30 * 60 * 1000
            }
          )

          res.cookie(
            'refresh_token',
            newRefreshToken,
            {
              httpOnly: true, secure: true,
              maxAge: stateExpiry
            }
          )


          res.status(200).json({
            message: 'tokens refreshed',
            sessionExpiry
          })

        } catch (err) {
          console.log(err);

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
    console.log(err.message)
    next(err);
  }
}
