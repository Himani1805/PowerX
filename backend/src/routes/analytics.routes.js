import express from 'express';
import { getLeadsOverTime } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get leads over time data
router.get('/leads-over-time', authenticate, getLeadsOverTime);

export default router;
