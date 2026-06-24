import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin routes (must be before /:id routes)
router.get('/admin', authorize('ADMIN', 'SUPERADMIN'), notificationController.getAdminNotifications.bind(notificationController));
router.post('/send-email', authorize('ADMIN', 'SUPERADMIN'), notificationController.sendEmail.bind(notificationController));

// Get notifications
router.get('/', notificationController.getNotifications.bind(notificationController));

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

// Delete notification
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

// Create notification (internal/admin use)
router.post('/', notificationController.createNotification.bind(notificationController));

export { router as notificationRouter };
