import express from 'express';
import { createOrder, getAllOrders, getUserOrders, getOrderById, updateOrderStatus, updatePaymentStatus, addTrackingNumber, cancelOrder, deleteOrder, getOrderStats } from '../controllers/OrderController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// Customer routes
router.route('/').post(createOrder);

router.route('/my-orders').get(getUserOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/cancel').patch(cancelOrder);

// Admin-only routes
router.route('/').get(restrictTo('ADMIN'), getAllOrders);

router.route('/stats').get(restrictTo('ADMIN'), getOrderStats);

router.route('/:id/status').patch(restrictTo('ADMIN'), updateOrderStatus);

router.route('/:id/payment').patch(restrictTo('ADMIN'), updatePaymentStatus);

router.route('/:id/tracking').patch(restrictTo('ADMIN'), addTrackingNumber);

router.route('/:id').delete(restrictTo('ADMIN'), deleteOrder);

export default router;
