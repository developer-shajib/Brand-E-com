import { Router } from 'express';
import { createUser, deleteUser, fetchAllUser, fetchSingleUser, updateUser } from '../controllers/UserController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { handleMulterError, profileMulter } from '../middlewares/multer.js';
const router = Router();

//  routes
router.route('/').get(fetchAllUser).post(createUser);
router.route('/:id').get(fetchSingleUser).put(verifyToken, profileMulter, handleMulterError, updateUser).patch(verifyToken, profileMulter, handleMulterError, updateUser).delete(verifyToken, deleteUser);

export default router;
