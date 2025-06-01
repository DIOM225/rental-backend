const mongoose = require('mongoose');
require('dotenv').config(); // if using .env for MONGO_URI

const Listing = require('./models/Listing'); // adjust the path to your Listing model

async function markAllListingsAsTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // or replace with your full MongoDB URI

    const result = await Listing.updateMany({}, { $set: { isTest: true } });
    console.log(`✅ ${result.modifiedCount} listings marked as test listings.`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Failed to update listings:', error);
  }
}

markAllListingsAsTest();
