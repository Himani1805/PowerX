import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Protect routes
export const protect = async (req, res, next) => {
  console.log('--- Auth Middleware ---');
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    } catch (error) {
      console.error('Error parsing token from Authorization header:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed',
        error: error.message 
      });
    }
  } else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('Token found in cookies');
  }

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token',
      receivedAuthHeader: !!req.headers.authorization,
      hasCookies: !!req.cookies
    });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);

    // Get user from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed',
      error: error.message 
    });
  }
};

// Grant access to specific roles
export const authorize = (roles) => {
  console.log("roles12", roles)
  return (req, res, next) => {
    console.log("req.user.role", req.user)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};