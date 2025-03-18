import express from 'express';

import { verifyToken } from '../middlewares/authMiddleware.js';
import { brandMulter, handleMulterError } from '../middlewares/multer.js';
import { createBrand, deleteBrand, fetchAllBrands, fetchSingleBrand, updateBrand, permanentDeleteBrand } from '../controllers/BrandController.js';

const router = express.Router();

// Public routes
router.route('/').get(fetchAllBrands).post(verifyToken, brandMulter, handleMulterError, createBrand);
router.route('/:idOrSlug').get(fetchSingleBrand).put(verifyToken, brandMulter, handleMulterError, updateBrand).patch(verifyToken, brandMulter, handleMulterError, updateBrand).delete(verifyToken, deleteBrand);

router.route('/:idOrSlug/permanent-delete').delete(verifyToken, permanentDeleteBrand);

export default router;
