import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Routes for notifications
router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .put(markAsRead);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

export default router;
