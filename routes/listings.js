const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// 🆕 Create a new listing
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const listing = new Listing({
      ...req.body,
      userId,
      status: 'pending',
    });

    const savedListing = await listing.save();
    res.status(201).json(savedListing);
  } catch (err) {
    console.error('❌ Failed to create listing:', err);
    res.status(500).json({ message: 'Erreur création annonce' });
  }
});

// 🔍 Public - Get published listings with filtering & pagination
router.get('/', async (req, res) => {
    try {
      const { type, page = 1, limit = 6, search = '' } = req.query;
  
      const query = { status: 'published' };
  
      if (type) {
        query.type = type;
      }
  
      if (search.trim()) {
        query.$text = { $search: search.trim() };
      }
  
      const skip = (page - 1) * limit;
  
      const listings = await Listing.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));
  
      const totalCount = await Listing.countDocuments(query);
      const hasMore = skip + listings.length < totalCount;
  
      res.json({ listings, hasMore });
    } catch (err) {
      console.error('❌ Error fetching listings:', err);
      res.status(500).json({ message: 'Erreur chargement annonces' });
    }
  });
  

// 🔐 Get current user's listings
router.get('/me', verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Erreur chargement annonces perso' });
  }
});

// 📝 Update a listing
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Annonce non trouvée' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Erreur modification annonce' });
  }
});

// ❌ Delete a listing
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Listing.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Annonce non trouvée' });
    res.json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression annonce' });
  }
});

// 🧾 Get a single listing by ID (must be published)
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status !== 'published') {
      return res.status(404).json({ message: 'Annonce introuvable ou non publiée' });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Erreur récupération annonce' });
  }
});
// 📈 Track contact clicks
router.post('/:id/contact-click', async (req, res) => {
    try {
      const listingId = req.params.id;
      await Listing.findByIdAndUpdate(listingId, {
        $inc: { contactClicks: 1 },
      });
      res.status(200).json({ message: 'Click tracked' });
    } catch (err) {
      console.error('❌ Failed to track click:', err);
      res.status(500).json({ message: 'Erreur tracking click' });
    }
  });
  // 📝 Add a review to a listing
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    const review = {
      rating,
      user: req.user.id,
    };

    listing.reviews.push(review);
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error('❌ Error submitting review:', err);
    res.status(500).json({ message: 'Erreur lors de l’ajout de la note' });
  }
});

  

module.exports = router;
