const express = require('express');
const router = express.Router();

const {
  register,
  verifyOTP,
  completeProfile,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  refreshToken
} = require('../controllers/authController');

const { protect } = require('../middlewares/protect');
const { upload } = require('../middlewares/multer');

// COMPLETE PROFILE (FORM-DATA + FILES)
router.put(
  '/complete-profile',
  protect,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'photos', maxCount: 6 },
    { name: 'videos', maxCount: 2 }
  ]),
  completeProfile
);

// AUTH FLOW
router.post('/register', register);
router.post('/verify-otp', protect, verifyOTP);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// PASSWORD RESET
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
