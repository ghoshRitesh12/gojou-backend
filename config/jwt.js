import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const verifyJwt = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token, secret,
      (err, decoded) => {
        if(err || !decoded)
          return reject(createHttpError.InternalServerError(err.message))

        resolve(decoded);
      }
    )
  })
}

export const signJwt = (data, secret, expiry) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data, secret, { expiresIn: expiry },
      (err, token) => {
        if(err || !token) 
          return reject(createHttpError.InternalServerError(err.message))          
        
        resolve(token);
      }
    )
  })
}
