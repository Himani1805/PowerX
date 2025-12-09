import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

// Create Express application instance
const app = express();

// --- Security and Logging Middleware ---

// Helmet: sets security-related HTTP headers
app.use(helmet());

// Rate Limiting (100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS: allow requests from frontend
// Configured for production with Vercel frontend
app.use(cors({
  origin: ['https://power-x-pink.vercel.app', 'http://localhost:5173'], // production and development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Performance & Logging
app.use(compression());
app.use(morgan('dev'));


// --- Body Parsers ---

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));


// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PowerX CRM API is running!',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});


// --- V1 API Routes ---
// TODO: Add API routes here, for example:
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/leads/:leadId/activities', activityRoutes)
app.use('/api/v1/dashboard', dashboardRoutes);


// --- Error Handling Middleware (last middleware) ---

// Catch 404 (Route Not Found)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler (centralized)
app.use(errorHandler);

// Export Express application
export default app;