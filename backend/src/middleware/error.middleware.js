import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import AppError from '../utils/AppError.js'; 
import jwt from 'jsonwebtoken';

/**
 * Handle Prisma Unique Constraint Violation (P2002)
 * @param {PrismaClientKnownRequestError} err - Prisma error object
 * @returns {AppError} - A new AppError object
 */
const handlePrismaDuplicateFieldsDB = (err) => {
  // P2002: Unique constraint failed on the field
  const fields = err.meta?.target.join(', ') || 'one or more fields';
  const message = `Duplicate field value: ${fields}. Please use another value.`;
  return new AppError(message, 400); // 400 Bad Request
};

/**
 * Handle other known Prisma errors (e.g., Record Not Found)
 * @param {PrismaClientKnownRequestError} err - Prisma error object
 * @returns {AppError} - A new AppError object
 */
const handlePrismaKnownError = (err) => {
  // Example: P2025: Record to update/delete not found
  if (err.code === 'P2025') {
    return new AppError('Resource not found.', 404);
  }
  let message = `Invalid data provided. Details: ${err.message.split('\n').pop()}`;
  return new AppError(message, 400); 
};

/**
 * Handle JWT-related errors
 * @param {Error} err - JWT error (JsonWebTokenError, TokenExpiredError)
 * @returns {AppError} - A new AppError object
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Your token has expired! Please log in again.', 401);
  }
  return new AppError('Authentication failed.', 401);
};


/**
 * Global Error Handling Middleware
 * Used in app.js after all routes.
 */
export const errorHandler = (err, req, res, next) => {
  // 1. Create a mutable error object
  let error = { ...err };
  error.message = err.message;
  
  // 2. Determine HTTP status code
  // FIX: Prefer AppError statusCode, or use prior middleware code, else default.
  if (err.statusCode) {
    error.statusCode = err.statusCode; // Use custom AppError statusCode
  } else if (res.statusCode !== 200) {
    error.statusCode = res.statusCode; // Use status set by previous middleware
  } else {
    error.statusCode = 500; // Default
  }
  
  // 3. Set operational status fields
  error.status = error.status || `${error.statusCode}`.startsWith('4') ? 'fail' : 'error';
  // FIX: Explicitly copy isOperational
  error.isOperational = err.isOperational || false; // AppError sets this to true


  // --- Specific Error Handling ---

  // A. JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
    // Keep statusCode/isOperational consistent after JWT transformation
  }

  // B. Prisma Errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { // Unique constraint violation (P2002)
      error = handlePrismaDuplicateFieldsDB(err);
    } else {
      error = handlePrismaKnownError(err);
    }
    // Mark Prisma errors as operational so they are exposed in production
    error.isOperational = true;
  }


  // --- Final Response ---

  // In development: send detailed error and stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: err, // original error object (for debugging)
      stack: err.stack,
    });
  }

  // In production: send only operational errors
  if (error.isOperational) {
    // Clean messages for operational errors (AppError, handled Prisma/JWT)
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Generic message for programming/unknown errors (avoid data leakage)
    console.error('ERROR UNHANDLED:', err); // log real error on server

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong! Please try again later.',
    });
  }
};