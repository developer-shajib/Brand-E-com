import express from 'express';
import { fetchAllCategories, fetchSingleCategory, createCategory, updateCategory, deleteCategory, permanentDeleteCategory } from '../controllers/CategoryController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(fetchAllCategories).post(verifyToken, createCategory);
router.route('/:idOrSlug').get(fetchSingleCategory).put(verifyToken, updateCategory).patch(verifyToken, updateCategory).delete(verifyToken, deleteCategory);

router.route('/:idOrSlug/permanent-delete').delete(verifyToken, permanentDeleteCategory);

export default router;
