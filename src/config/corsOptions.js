const allOrigins = [
  'http://localhost:3000', 'https://gojou.vercel.app'
];

const corsOptions = {
  origin: allOrigins, 
  credentials: true,
  optionSuccessStatus: 200,
}

export default corsOptions;
