import express from 'express';
import { createServer, createServer as createHttpServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { corsOptions } from './config/config.js';
import authRoutes from './routes/auth.route.js';
import leadRoutes from './routes/lead.route.js';
import leadHistoryRoutes from './routes/leadHistory.routes.js';
import notificationRoutes from './routes/notification.route.js';
import analyticsRoutes from './routes/analytics.routes.js';
import WebSocketService from './services/websocket.service.js';
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
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  // res.json({ status: 'ok', message: 'API is running' });
   return res.status(200).json({ message: 'API is running' });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Store server instances
let currentServer = null;
let currentWss = null;

// Function to close server instances
const closeServer = () => {
  return new Promise((resolve) => {
    if (currentWss) {
      currentWss.close(() => {
        if (currentServer) {
          currentServer.close(() => {
            currentServer = null;
            currentWss = null;
            resolve();
          });
        } else {
          currentWss = null;
          resolve();
        }
      });
    } else if (currentServer) {
      currentServer.close(() => {
        currentServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Start server
const startServer = async () => {
  try {
    // Close any existing server instances
    await closeServer();
    
    // Test database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Database connected successfully');

    // Function to create and start the server
    const createAndStartServer = async (port) => {
      try {
        // Close any existing server instances
        await closeServer();
        
        // Create HTTP server
        const server = createServer(app);
        
        // Create WebSocket server
        const wss = new WebSocketServer({ noServer: true });
        
        // Initialize WebSocket service
        global.wsService = new WebSocketService(wss);
        
        // Store references
        currentServer = server;
        currentWss = wss;
        
        // Handle WebSocket upgrade
        server.on('upgrade', (request, socket, head) => {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        });

        server.listen(port, '0.0.0.0', () => {
          console.log(`Server running on port ${port}`);
          console.log(`WebSocket server running on ws://localhost:${port}/ws`);
        }).on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying port ${Number(port) + 1}...`);
            createAndStartServer(Number(port) + 1);
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });
      } catch (error) {
        console.error('Error creating server:', error);
        process.exit(1);
      }
    };

    // Start with the configured port or 3000
    await createAndStartServer(PORT || 3000);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});