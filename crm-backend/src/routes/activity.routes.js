import express from 'express';
// Import Auth Middleware
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as activityController from '../controllers/activity.controller.js'; 

// 3. Placeholder for Activity Controller Functions
// TODO: Import functions from src/controllers/activity.controller.js
// const activityController = {
//     createActivity: (req, res) => res.status(501).json({ message: 'Create Activity not implemented.' }),
//     getActivitiesForLead: (req, res) => res.status(501).json({ message: 'Get Activities for Lead not implemented.' }),
// };

// 1. Create Router object and set mergeParams: true
// mergeParams: true allows parameters from parent router (e.g., leadId).
const router = express.Router({ mergeParams: true });

// Required roles for all activity management routes
const ALL_ROLES = ['ADMIN', 'MANAGER', 'SALES_EXECUTIVE'];

// --- Activity Management Routes ---
// Note: These routes are mounted under /api/v1/leads/:leadId/activities/

/**
 * @route POST /api/v1/leads/:leadId/activities
 * @desc Create a new activity for a lead
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.post(
    '/',
    authenticate,
    authorize(ALL_ROLES),
    activityController.createActivity // Controller function use
);

/**
 * @route GET /api/v1/leads/:leadId/activities
 * @desc Get all activities for a specific lead
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.get(
    '/',
    authenticate,
    authorize(ALL_ROLES),
    activityController.getActivitiesForLead // Controller function use
);

export default router;