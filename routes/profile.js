const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// ✅ GET current user's profile
const getProfileHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// ✅ UPDATE current user's profile
const updateProfileHandler = async (req, res) => {
  try {
    const { name, phone, profilePic, bio } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profilePic, bio },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    console.error('❌ Failed to update profile:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// 🛠 Routes for both `/` and `/me`
router.get('/', verifyToken, getProfileHandler);
router.get('/me', verifyToken, getProfileHandler);

router.put('/', verifyToken, updateProfileHandler);
router.put('/me', verifyToken, updateProfileHandler);

module.exports = router;
