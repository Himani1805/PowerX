import express from 'express';
// Import Auth Middleware
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

// 3. Placeholder for Dashboard Controller Functions
// TODO: Import functions from src/controllers/dashboard.controller.js
// const dashboardController = {
//     getLeadsByStatus: (req, res) => res.status(501).json({ message: 'Get Leads by Status not implemented.' }),
//     getLeadsByOwner: (req, res) => res.status(501).json({ message: 'Get Leads by Owner not implemented.' }),
// };

// 1. Create Router Object
const router = express.Router();

// Required roles for dashboard routes
const ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'SALES_EXECUTIVE'];

// Authenticate and authorize all routes
router.use(authenticate, authorize(ALLOWED_ROLES));

// --- Dashboard & Analytics Routes ---

/**
 * @route GET /api/v1/dashboard/status
 * @desc Get counts of leads grouped by status
 * @access Private (ADMIN, MANAGER)
 */
router.get(
    '/status',
    dashboardController.getLeadsByStatus // Controller function use
);

/**
 * @route GET /api/v1/dashboard/owner
 * @desc Get counts of leads grouped by owner
 * @access Private (ADMIN, MANAGER)
 */
router.get(
    '/owner',
    dashboardController.getLeadsByOwner // Controller function use
);

export default router;