import express from 'express';
import { fetchAllRoles, fetchSingleRole, createRole, updateRole, deleteRole, permanentDeleteRole, assignPermissions } from '../controllers/RoleController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All role routes are protected and restricted to admin users
router.use(verifyToken, restrictTo('ADMIN'));

// Role routes
router.route('/').get(fetchAllRoles).post(createRole);

router.route('/:idOrSlug').get(fetchSingleRole).put(updateRole).patch(updateRole).delete(deleteRole);

router.route('/:idOrSlug/permanent-delete').delete(permanentDeleteRole);

// Special route for assigning permissions
router.route('/:idOrSlug/permissions').post(assignPermissions);

export default router;
