import dotenv from "dotenv"
// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI;
const SALT = process.env.SALT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173', // Alternative localhost
  'http://localhost:3000', // Common React port
  process.env.FRONTEND_URL // From environment variable
].filter(Boolean); // Remove any undefined values

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Auth-Token',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200 // For legacy browser support
};

export {PORT, MONGODB_URI, SALT, JWT_SECRET_KEY, JWT_EXPIRES_IN};