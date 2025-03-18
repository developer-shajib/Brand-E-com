import express from 'express';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';
import { createProduct, deleteProduct, fetchAllProducts, fetchSingleProduct, permanentDeleteProduct, updateProduct } from '../controllers/ProductController.js';
import { productMulter, handleMulterError } from '../middlewares/multer.js';
const router = express.Router();

router.route('/').get(fetchAllProducts).post(verifyToken, productMulter, handleMulterError, createProduct);
router.route('/:id').get(fetchSingleProduct).put(verifyToken, productMulter, handleMulterError, updateProduct).patch(verifyToken, productMulter, handleMulterError, updateProduct).delete(verifyToken, restrictTo('ADMIN'), deleteProduct);
router.route('/:id/permanent-delete').delete(verifyToken, permanentDeleteProduct);

export default router;
