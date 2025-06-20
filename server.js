const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Routes
const authRoute = require('./routes/auth');
const listingsRoute = require('./routes/listings');
const adminRoute = require('./routes/admin');
const profileRoute = require('./routes/profile');
const userRoute = require('./routes/user');
const approvalRequestRoutes = require('./routes/approvalRequests');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Middlewares - Place CORS and JSON parser first
const allowedOrigins = [
  'http://localhost:3000',
  'https://client-5yhfrth0g-mohameds-projects-7178de3c.vercel.app',
  'https://aptmeuble.com',
  'https://www.aptmeuble.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());

// ✅ Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/listings', listingsRoute);
app.use('/api/admin', adminRoute);
app.use('/api/profile', profileRoute);
app.use('/api/users', userRoute);
app.use('/api/requests', approvalRequestRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
