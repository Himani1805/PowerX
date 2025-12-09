import express from 'express';
// Import Auth Middleware
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as leadController from '../controllers/lead.controller.js'; 

// Placeholder for Lead Controller functions
// TODO: Import functions from src/controllers/lead.controller.js
// const leadController = {
//     createLead: (req, res) => res.status(501).json({ message: 'Create Lead not implemented.' }),
//     getLeads: (req, res) => res.status(501).json({ message: 'Get Leads not implemented.' }),
//     getLeadById: (req, res) => res.status(501).json({ message: 'Get Lead by ID not implemented.' }),
//     updateLead: (req, res) => res.status(501).json({ message: 'Update Lead not implemented.' }),
//     deleteLead: (req, res) => res.status(501).json({ message: 'Delete Lead not implemented.' }),
// };

// Create router
const router = express.Router();

// Required roles for lead management routes
const ALL_ROLES = ['ADMIN', 'MANAGER', 'SALES_EXECUTIVE'];
const ADMIN_MANAGER_ROLES = ['ADMIN', 'MANAGER'];

// --- Lead Management Routes ---

/**
 * @route POST /api/v1/leads/
 * @desc Create a new lead
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.post(
    '/',
    authenticate,
    authorize(ALL_ROLES),
    leadController.createLead
);

/**
 * @route GET /api/v1/leads/
 * @desc Get all leads
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.get(
    '/',
    authenticate,
    authorize(ALL_ROLES),
    leadController.getLeads
);

/**
 * @route GET /api/v1/leads/:id
 * @desc Get a specific lead
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.get(
    '/:id',
    authenticate,
    authorize(ALL_ROLES),
    leadController.getLeadById
);

/**
 * @route PUT /api/v1/leads/:id
 * @desc Update a lead
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.patch(
    '/:id',
    authenticate,
    authorize(ALL_ROLES),
    leadController.updateLead
);

/**
 * @route PUT /api/v1/leads/:id
 * @desc Update a lead (Legacy support)
 * @access Private (ADMIN, MANAGER, SALES_EXECUTIVE)
 */
router.put(
    '/:id',
    authenticate,
    authorize(ALL_ROLES),
    leadController.updateLead
);

/**
 * @route DELETE /api/v1/leads/:id
 * @desc Delete a lead
 * @access Private (ADMIN, MANAGER)
 */
router.delete(
    '/:id',
    authenticate,
    authorize(ADMIN_MANAGER_ROLES),
    leadController.deleteLead
);

export default router;