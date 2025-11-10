// backend/src/routes/leadHistory.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getLeadHistory } from '../controllers/leadHistory.controller.js';

const router = express.Router();

// Get lead history
router.get('/:leadId/history', protect, getLeadHistory);

export default router;