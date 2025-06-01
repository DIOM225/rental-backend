const mongoose = require('mongoose');

// Review schema
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Listing schema
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    commune: { type: String },
    type: {
      type: String,
      enum: ['monthly', 'daily'],
      required: true,
    },
    price: { type: Number, required: true },
    description: { type: String },
    images: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    phone: {
      type: String,
      required: true,
    },
    isTest: {
        type: Boolean,
        default: false,
      },
      

    reviews: [reviewSchema],

    // ✅ NEW: Tracks how many users clicked to contact the host
    contactClicks: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['published', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Indexes
listingSchema.index({ status: 1 });
listingSchema.index({ type: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ city: 1, commune: 1 });

// Full-text search index
listingSchema.index({
  title: 'text',
  city: 'text',
  commune: 'text',
  description: 'text',
});

module.exports = mongoose.model('Listing', listingSchema);
