import express from 'express';
import { fetchAllTags, fetchSingleTag, createTag, updateTag, deleteTag, permanentDeleteTag } from '../controllers/TagController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/').get(fetchAllTags).post(verifyToken, createTag);
router.route('/:idOrSlug').get(fetchSingleTag).put(verifyToken, updateTag).patch(verifyToken, updateTag).delete(verifyToken, deleteTag);

router.route('/:idOrSlug/permanent-delete').delete(verifyToken, permanentDeleteTag);

export default router;
