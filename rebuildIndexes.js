const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await Listing.syncIndexes(); // Re-sync indexes
    console.log('✅ Indexes rebuilt');
    process.exit();
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });
