import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
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
  .get(authorize('ADMIN', 'MANAGER'), getLeads);

// Routes for individual lead operations
router.route('/my-leads')
  .get(authorize('SALES'), getMyLeads);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('ADMIN', 'MANAGER'), deleteLead);

// Transfer lead to another user (MANAGER and ADMIN only)
router.put('/:id/transfer', authorize('ADMIN', 'MANAGER'), transferLead);

export default router;
