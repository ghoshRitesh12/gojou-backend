import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createHttpError from 'http-errors';
import passport from 'passport';
import https from 'http';

import connectDB from './config/connectDB.js';
import corsOptions from './config/corsOptions.js';
import redisClient from './config/initRedis.js';

// routers
import signupRouter from './routes/signup.js';
import loginRouter from './routes/login.js';
import googleAuthRouter from './routes/googleAuth.js';
import genTokenRouter from './routes/genToken.js';
import logoutRouter from './routes/logout.js'
import apiRouter from './api/api.router.js';
import favoritesRouter from './routes/favorites.js';
import roomsRouter from './routes/rooms.js';
import roomRouter from './routes/room.js';

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
  await redisClient.connect();

  app.get('/', (req, res) => {
    res.send('anime-watch-party HOME ROUTE');
  })

  app.get('/inactive', (req, res) => res.sendStatus(200));
  app.use('/signup', signupRouter);
  app.use('/login', loginRouter);
  app.use('/google-auth', googleAuthRouter);
  app.use('/refresh', genTokenRouter);
  app.use('/logout', logoutRouter);
  
  app.use('/api/v1', apiRouter);
  app.use('/favorites', favoritesRouter);
  app.use('/rooms', roomsRouter);
  app.use('/room', roomRouter);

  app.get('/bruh', checkAuth, (req, res) => {
    console.log(req.user)
    res.send('welcome to authed route')
  });


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

