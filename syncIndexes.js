const mongoose = require('mongoose');
require('dotenv').config();

const Listing = require('./models/Listing');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await Listing.syncIndexes();
    console.log('✅ Indexes synced');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
