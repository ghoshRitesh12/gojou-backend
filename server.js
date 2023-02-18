import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import createHttpError from 'http-errors';

import corsOptions from './config/corsOptions.js';

// routers
import apiRouter from './api/api.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(morgan('dev'));
app.use(express.json());


(async () => {
  // db connection

  app.get('/', (req, res) => {
    res.send('anime-watch-party HOME ROUTE');
  })

  app.use('/api/v1', cors(corsOptions), apiRouter);

  app.get('/niq', (req, res) => {
    res.sendFile('/anime-watch-party/backend/z_frontend/TEST.html');
  })

  app.use((req, res, next) => next(createHttpError.NotFound()));
  app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status).json({ error });
  })

  
  app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

})();

// js/watch.min.js?v=1.9:1

