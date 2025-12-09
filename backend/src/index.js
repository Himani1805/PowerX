// import 'dotenv/config'; // Load dotenv first
import dotenv from "dotenv";
import http from "http"; // http module
import app from "./app.js"; // Import Express app
import prisma from "./utils/prisma.js";
import { Server } from "socket.io";
// import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client (if needed)
// const prisma = new PrismaClient();
dotenv.config();
// PORT configuration
const PORT = process.env.PORT || 8000;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io and attach it to the server
const io = new Server(server, {
  cors: {
    origin: [
       "http://localhost:5173", 
       "https://power-x-pink.vercel.app"
    ], // Allows connection from any client origin
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Make the io instance globally accessible (used in controllers)
global.io = io;

io.on("connection", (socket) => {
  console.log(`✅ [Socket.io] A user connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ [Socket.io] User disconnected: ${socket.id}`);
  });
});

// Start the server
// server.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log(`🔗 Socket.io listening on port ${PORT}`);
// });

// process.on('unhandledRejection', (err) => {
//     console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//     console.log(err.name, err.message);
//     server.close(() => {
//         process.exit(1);
//     });
// });
/**
 * Function to connect database and start server
 */
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful.");

    // Wrap Express app in an HTTP server if needed (already done above)
    // const server = http.createServer(app);

    // Start listening
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Socket.io listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Database connection failed or Server startup error:",
      error.message
    );
    // Exit process with failure
    process.exit(1);
  } 
}

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Start server
startServer();

// Ensure Prisma disconnects when server terminates
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("👋 Prisma Client disconnected. Server shutting down.");
  process.exit(0);
});


