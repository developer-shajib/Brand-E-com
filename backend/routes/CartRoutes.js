import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, syncCart, getCartCount } from '../controllers/CartController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Cart routes
router.route('/').get(getCart).post(addToCart).delete(clearCart);

router.route('/count').get(getCartCount);

router.route('/sync').post(syncCart);

router.route('/:itemId').put(updateCartItem).delete(removeCartItem);

export default router;
