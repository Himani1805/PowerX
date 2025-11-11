import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/config.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

// API Routes
app.use('/api/analytics', analyticsRoutes);

// Routes will be added here

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export { app };  // Named export instead of default