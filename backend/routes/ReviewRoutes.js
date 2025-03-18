import express from 'express';
import { fetchAllReviews, fetchProductReviews, fetchUserReviews, fetchSingleReview, createReview, updateReview, deleteReview, permanentDeleteReview, getReviewStats } from '../controllers/ReviewController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(fetchAllReviews).post(verifyToken, createReview);
router.route('/:id').get(fetchSingleReview).put(verifyToken, updateReview).patch(verifyToken, updateReview).delete(verifyToken, deleteReview);
router.route('/:id/permanent-delete').delete(restrictTo('ADMIN'), permanentDeleteReview);
router.route('/product/:productId').get(fetchProductReviews);
router.route('/stats/:productId').get(getReviewStats);
router.route('/user/:userId').get(fetchUserReviews);

export default router;
