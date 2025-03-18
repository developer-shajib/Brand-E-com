import express from 'express';
import { fetchAllPermissions, fetchSinglePermission, createPermission, updatePermission, deletePermission, permanentDeletePermission } from '../controllers/PermissionController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All permission routes are protected and restricted to admin users
router.use(verifyToken, restrictTo('ADMIN'));

// Permission routes
router.route('/').get(fetchAllPermissions).post(createPermission);
router.route('/:idOrSlug').get(fetchSinglePermission).put(updatePermission).patch(updatePermission).delete(deletePermission);

router.route('/:idOrSlug/permanent-delete').delete(permanentDeletePermission);

export default router;
