import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createHttpError from 'http-errors';
import passport from 'passport';
import session from 'express-session';
import https from 'http';

import connectDB from './config/connectDB.js';
import corsOptions from './config/corsOptions.js';
import redisClient from './config/initRedis.js';

// routers
import signupRouter from './routes/signup.js'
import loginRouter from './routes/login.js'
import googleAuthRouter from './routes/googleAuth.js'
import logoutRouter from './routes/logout.js'
import apiRouter from './api/api.router.js';

import { checkAuth } from './middlewares/checkAuth.js';

import './config/passportAuth.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize());


(async () => {
  await connectDB(process.env.DATABASE_CONNECTION_URI);
  // await redisClient.connect();

  app.get('/', (req, res) => {
    res.send('anime-watch-party HOME ROUTE');
    // res.redirect(process.env.FRONTEND_BASE_URL)
  })

  app.get('/inactive', (req, res) => res.sendStatus(200));
  app.use('/signup', signupRouter);
  app.use('/login', loginRouter);
  app.use('/google-auth', googleAuthRouter);
  app.use('/logout', logoutRouter);

  // app.use(checkAuth);

  app.get('/bruh', checkAuth, (req, res) => {
    console.log(req.logout)
    res.send('welcome to authed route')
  });
  app.use('/api/v1' ,cors(corsOptions), apiRouter);
  

  app.get('/ni', (req, res) => {
    res.sendFile('/anime-watch-party/backend/z_frontend/TEST.html');
  })

  app.use((req, res, next) => next(createHttpError.NotFound()));
  app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status).json({ error });
  })

  
  app.listen(PORT, () => (
    console.log(`🚀 @ http://localhost:${PORT}`)
  ));

  // setInterval(
  //   () => https.get('http://localhost:5000/inactive'), 
  //   8 * 60 * 1000
  // )

})();

