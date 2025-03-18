import { Router } from 'express';
import { forgotPassword, resendVerificationEmail, resetPassword, userLogin, userLogout, userRegister, verifyEmail } from '../controllers/AuthController.js';

const router = Router();

// <!-- Authentication  -->
router.route('/login').post(userLogin);
router.route('/register').post(userRegister);
router.route('/logout').post(userLogout);
router.route('/verify-email').get(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/resend-verification-email').post(resendVerificationEmail);
export default router;
