import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import createHttpError from 'http-errors';
import passport from 'passport';
import session from 'express-session';

import CryptoJS from 'crypto-js';

import corsOptions from './config/corsOptions.js';
import redisClient from './config/initRedis.js';

// routers
import signupRouter from './routes/signup.js'
import loginRouter from './routes/login.js'
import googleAuthRouter from './routes/googleAuth.js'
import logoutRouter from './routes/logout.js'
import apiRouter from './api/api.router.js';

import './config/passportAuth.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret: 'doggo',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 7 * 60 * 60
  }
}))
app.use(passport.initialize());
app.use(passport.session());


(async () => {
  // db connection
  // await redisClient.connect();

  app.get('/', (req, res) => {
    console.log(crypto);
    res.send('anime-watch-party HOME ROUTE');
  })


  app.use('/signup', signupRouter);
  app.use('/login', loginRouter);
  app.use('/google-auth', googleAuthRouter);

  app.use('/logout', logoutRouter);
  app.use('/api/v1', cors(corsOptions), apiRouter);





  app.get('/ni', (req, res) => {
    res.sendFile('/anime-watch-party/backend/z_frontend/TEST.html');
  })

  app.use((req, res, next) => next(createHttpError.NotFound()));
  app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status).json({ error });
  })

  
  app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

})();

