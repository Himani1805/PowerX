import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js'; // Prisma Client Singleton
import AppError from '../utils/AppError.js'; // Import AppError
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

/**
 * Helper to generate a JWT (JSON Web Token)
 * @param {object} payload - Data to embed in the token (e.g., userId, role)
 * @returns {string} - Generated JWT
 */
const generateToken = (payload) => {
  // Ensure JWT_SECRET is set in .env
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // In production this would be a critical error
    throw new Error('JWT_SECRET not defined in environment variables.');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1d', // 24 hours
  });
};

/**
 * @desc Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  let { name, email, password } = req.body;

  // Normalize email
  if (email) {
    email = email.toLowerCase().trim();
  }

  // 1. Input validation
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password.', 400));
  }

  try {
    // 3. Set default role and apply admin logic
    let role = 'SALES_EXECUTIVE';
    if (email === 'admin@crm.com') {
      role = 'ADMIN';
    }

    // 4. Hash password (salt rounds 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new user via Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Use Role enum
        role: role, 
      },
      // Do not return password
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // 6. Generate JWT
    const token = generateToken({ id: newUser.id, role: newUser.role });

    // 7. Success response
    res.status(201).json({
      status: 'success', 
      message: 'User registered successfully',
      user: newUser,
      token,
    });

  } catch (error) {
    // ✅ P2002: Unique constraint failed (duplicate email) -> map to 400 AppError
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return next(new AppError('User already exists with this email address.', 400));
    }
    // Pass any other errors to global error handler
    next(error);
  }
};

/**
 * @desc Log in a user and return a JWT
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  let { email, password } = req.body;

  // Normalize email
  if (email) {
    email = email.toLowerCase().trim();
  }

  // 1. Input validation
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  try {
    // 2. Find user by email
    const user = await prisma.user.findUnique({ 
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            password: true, // include password hash for comparison
        }
    });

    // 3. Check user exists
    if (!user) {
        console.log(`Login failed: User not found for email: ${email}`);
        // Return 401 if not found
        return next(new AppError('Invalid credentials (email or password).', 401));
    }
    
    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`Login attempt for ${email}: User found. Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
        // 401 if password mismatch
        return next(new AppError('Invalid credentials (email or password).', 401));
    }
    
    // 5. Generate JWT
    const token = generateToken({ id: user.id, role: user.role });

    // 6. Send token and user data in response (remove password)
    const { password: _password, ...userData } = user; // remove password and avoid name collision

    // Success response
    res.status(200).json({
        status: 'success', 
        message: 'Login successful',
        token,
        user: userData,
    });

  } catch (error) {
    // Pass error to global handler
    next(error);
  }
};

import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

/**
 * @desc Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next(new AppError('There is no user with that email address.', 404));
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token for DB storage
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save to DB with expiry (10 mins)
        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        // Send email (unhashed token)
        // Note: Frontend URL should be configured in env, defaulting for now
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Reset password
 * @route PATCH /api/v1/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Hash token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired.', 400));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        // Log user in (optional, or just return success)
        const newToken = generateToken({ id: user.id, role: user.role });

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully!',
            token: newToken
        });

    } catch (error) {
        next(error);
    }
};