const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// GET all users (no passwords)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// DELETE a user by ID
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// GET all listings
router.get('/listings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load listings' });
  }
});

// DELETE a listing by ID
router.delete('/listings/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

// GET admin dashboard stats
router.get('/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const monthlyCount = await Listing.countDocuments({ type: 'monthly' });
    const dailyCount = await Listing.countDocuments({ type: 'daily' });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email');

    const recentListings = await Listing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title city price');

    res.json({
      totalUsers,
      totalListings,
      monthlyCount,
      dailyCount,
      recentUsers,
      recentListings,
    });
  } catch (err) {
    console.error('❌ Failed to get dashboard stats:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get top contacted listings
router.get('/popular-listings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ contactClicks: -1 })
      .limit(50); // You can adjust the limit
    res.json(listings);
  } catch (err) {
    console.error('❌ Error fetching popular listings:', err);
    res.status(500).json({ message: 'Erreur chargement des annonces populaires' });
  }
});

/* ✅ NEW: Get pending listings */
router.get('/pending-listings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error('❌ Failed to load pending listings:', err);
    res.status(500).json({ message: 'Failed to load pending listings' });
  }
});

/* ✅ NEW: Approve or reject a listing */
router.put('/listings/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(listing);
  } catch (err) {
    console.error('❌ Failed to update listing status:', err);
    res.status(500).json({ message: 'Failed to update listing status' });
  }
});
router.get('/listings/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.json(listing);
    } catch (err) {
      console.error('❌ Failed to load admin listing:', err);
      res.status(500).json({ message: 'Error loading listing' });
    }
  });
  

module.exports = router;
