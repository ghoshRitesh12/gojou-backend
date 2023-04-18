import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';

import User from '../models/User.js';

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})


passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log(profile);

    try {
      const foundUser = await User.findOne({ googleId: profile.id }, ['name', 'email', 'profilePicture']);
      if(foundUser) return done(null, foundUser);
  
      const newUser = await User.create({
        googleId: profile.id,
        name: profile._json.name,
        email: profile._json.email,
        profilePicture: profile._json.picture ,
      });
  
      return done(null, {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      });
      
    } catch (err) {
      console.log(err);
      return done(err, null);
    }
  }
));


passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: req => (req.cookies?.access_token),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET
    },
    (payload, done) => done(null, payload)
  )
)

// passport.use(
//   'access',
//   new JwtStrategy(
//     {
//       jwtFromRequest: req => (req.cookies?.access_token),
//       secretOrKey: process.env.ACCESS_TOKEN_SECRET
//     },
//     (payload, done) => done(null, payload)
//   )
// )
// passport.use(
//   'refresh',
//   new JwtStrategy(
//     {
//       jwtFromRequest: req => (req.cookies?.refresh_token),
//       secretOrKey: process.env.REFRESH_TOKEN_SECRET
//     },
//     (payload, done) => done(null, payload)
//   )
// )

