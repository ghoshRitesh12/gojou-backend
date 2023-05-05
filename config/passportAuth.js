import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';

import User from '../models/User.js';

passport.use(User.createStrategy());


passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const foundUser = await User.findOne({ googleId: profile.id },  ['name', 'email', 'profilePicture']);
        if(foundUser) return done(null, foundUser);
        
        const newUser = await User.create({
          googleId: profile.id,
          name: profile._json.name,
          email: profile._json.email,
          profilePicture: profile._json.picture ,
        });
        
        return done(null, newUser);
        
      } catch (err) {
        console.log(err);
        return done(err, false);
      }

    }
  )
);


passport.use(
  'access-jwt',
  new JwtStrategy(
    {
      jwtFromRequest: req => req.cookies?.access_token,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET
    },
    (payload, done) => done(null, payload)
  )
)

passport.use(
  'refresh-jwt',
  new JwtStrategy(
    {
      jwtFromRequest: req => req.cookies?.refresh_token,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET
    },
    (payload, done) => done(null, payload)
  )
)

