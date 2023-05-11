import dotenv from 'dotenv';

dotenv.config()

const allOrigins = [
  process.env.FRONTEND_DEV_BASE_URL, 
  process.env.FRONTEND_PROD_BASE_URL
];

const corsOptions = {
  origin: allOrigins, 
  credentials: true,
  optionSuccessStatus: 200,
}

export default corsOptions;
