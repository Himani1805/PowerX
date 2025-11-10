import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getLeadActivities, createActivity } from '../controllers/activity.controller.js';
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getMyLeads,
  transferLead
} from '../controllers/lead.controller.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Routes for managing leads
router.route('/')
  .post(authorize('ADMIN', 'MANAGER', 'SALES'), createLead)
  .get(authorize('ADMIN', 'MANAGER', 'SALES'), getLeads);

// Routes for individual lead operations
router.route('/my-leads')
  .get(authorize('ADMIN', 'MANAGER', 'SALES'), getMyLeads);

router.route('/:id')
  .get(getLead)
  // .put(updateLead)
  .patch(updateLead) // Add support for PATCH method
  .delete(authorize('ADMIN', 'MANAGER'), deleteLead);

// Transfer lead to another user (MANAGER and ADMIN only)
router.put('/:id/transfer', authorize('ADMIN', 'MANAGER'), transferLead);

// Activities for a specific lead
router.route('/:leadId/activities')
  .get(authorize('ADMIN', 'MANAGER', 'SALES'), getLeadActivities)
  .post(authorize('ADMIN', 'MANAGER', 'SALES'), createActivity);

export default router;
