import passport from "passport";
import createHttpError from "http-errors";
import { verifyJwt } from "../config/jwt.js";

const token = {
  refreshTokenId: null
}

export function checkAuth(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if(!refreshToken)
      throw createHttpError.Unauthorized();

    passport.authenticate(
      'jwt', 
      { session: false }, 
      async (err, accessDecoded) => {
        if(err || !accessDecoded) 
          throw createHttpError.InternalServerError(err);
        

        const refreshDecoded = await verifyJwt(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        if(accessDecoded.id !== refreshDecoded.id) 
          throw createHttpError.Unauthorized();
        
        next();
      }
    )(req, res)
    
  } catch (err) {
    console.log(err.message);
    // next(createHttpError.InternalServerError(err.message));
    next(err);
  }
}


// export function checkAuth(req, res, next) {
//   try {
//     const refreshToken = req.cookies?.refresh_token;
//     if(!refreshToken)
//       throw createHttpError.Unauthorized();

//     passport.authenticate(
//       'refresh', 
//       { session: false }, 
//       async (err, refreshDecoded) => {
//         if(err || !refreshDecoded)
//           throw createHttpError.InternalServerError(err.message);

//         token.refreshTokenId = refreshDecoded.id;
//         // next();
//       }
//     )(req, res)

//     passport.authenticate(
//       'access', 
//       { session: false }, 
//       async (err, accessDecoded) => {
//         if(err || !accessDecoded)
//           throw createHttpError.InternalServerError(err.message);


//         if(accessDecoded.id !== token.refreshTokenId) 
//           throw createHttpError.Unauthorized();
        
//         next();
//       }
//     )(req, res)
    
//   } catch (err) {
//     console.log(err);
//     // next(createHttpError.InternalServerError(err.message));
//     next(err);
//   }
// }
