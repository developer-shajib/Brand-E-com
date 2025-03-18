import dotenv from 'dotenv';
dotenv.config();

// allowed origin
const allowedOrigins = [process.env.CLIENT_URL];

// cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['set-cookie']
};

// exports
export default corsOptions;
