const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const { signAccessToken, signRefreshToken } = require('../middlewares/jwt');
const { uploadONCloudinary } = require('../utils/cloudinary');

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { email, phoneNumber, password, firstName, lastName } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (exists)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();

    const user = await User.create({
      email,
      phoneNumber,
      password: hashedPassword,
      firstName,
      lastName,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    await sendEmail(email, otp);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'OTP sent successfully',
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Account verified successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token or OTP' });
  }
};

/* ================= COMPLETE PROFILE ================= */
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, interests, description, prompts } = req.body;

    let profilePicture;
    let photos = [];
    let videos = [];

    // Upload profile picture
    if (req.files?.profilePicture) {
      const result = await uploadONCloudinary(req.files.profilePicture[0].path);
      profilePicture = result?.secure_url;
    }

    // Upload photos
    if (req.files?.photos) {
      for (const file of req.files.photos) {
        const result = await uploadONCloudinary(file.path);
        if (result) photos.push(result.secure_url);
      }
    }

    // Upload videos
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const result = await uploadONCloudinary(file.path);
        if (result) videos.push(result.secure_url);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location,
        interests: interests ? JSON.parse(interests) : [],
        description,
        prompts: prompts ? JSON.parse(prompts) : [],
        profilePicture,
        photos,
        videos,
        isProfileCompleted: true,
        notifications: {
          pauseAll: false,
          events: false,
          groups: false,
          messages: false
        }
      },
      { new: true }
    );

    res.json({ message: 'Profile completed successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ message: 'Verify account first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ message: 'Login successful', accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken(user._id);

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(email, otp);
    res.json({ message: 'Password reset OTP sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= VERIFY RESET OTP ================= */
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
