import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role } = req.body;
    
    // Log the received data
    console.log('Creating user with:', { 
      name: name ? 'Provided' : 'Missing', 
      email: email ? 'Provided' : 'Missing',
      role: role || 'SALES (default)'
    });

    // Validate input
    if (!name || !email || !password) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      console.log('Validation failed - missing fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if user already exists
    let userExists;
    try {
      userExists = await prisma.user.findFirst({
         where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (userExists) {
        console.log('Registration failed - user already exists:', email);
        return res.status(400).json({ 
          success: false,
          message: 'User already exists with this email' 
        });
      }
    } catch (dbError) {
      console.error('Database error during user existence check:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error checking user existence',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    let user, token;
    try {
      // Hash password
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Password hashed successfully');

      // Create user
      console.log('Creating user in database...');
      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role || 'SALES' // Default to SALES if role not provided
        }
      });
      console.log('User created successfully:', { id: user.id, email: user.email });

      // Generate token
      console.log('Generating JWT token...');
      token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log('Token generated successfully');

      // Remove password from output
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token
        }
      });
      
    } catch (error) {
      console.error('Error during user creation or token generation:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') { // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res) => {
  console.log("login", req.body)
  try {
    const { email, password } = req.body;
console.log("login1", email, password)
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
    email: {
      equals: email.trim(),
      mode: 'insensitive'
    }
  }
    });
console.log("user", user)
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from output
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, 
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};