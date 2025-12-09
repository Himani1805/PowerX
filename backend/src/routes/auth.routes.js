import express from 'express';
import * as authController from '../controllers/auth.controller.js'; 

// Placeholder for Auth Controller (if needed later)
// TODO: Import functions from src/controllers/auth.controller.js
// const authController = {
//     // These will be register and login functions
//     register: (req, res) => res.status(501).json({ message: "Registration not implemented yet." }),
//     login: (req, res) => res.status(501).json({ message: "Login not implemented yet." }),
// };

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Log in user and return JWT
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route PATCH /api/v1/auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
router.patch('/reset-password/:token', authController.resetPassword);

export default router;
