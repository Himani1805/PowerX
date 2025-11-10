import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { corsOptions } from './config/config.js';
import authRoutes from './routes/auth.route.js';
import leadRoutes from './routes/lead.route.js';
import leadHistoryRoutes from './routes/leadHistory.routes.js';
import notificationRoutes from './routes/notification.route.js';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers['content-type'],
    body: req.body
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leadHistory', leadHistoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

startServer();