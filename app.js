
// ✅ Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ✅ Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://engage-sphere-new-frontend.vercel.app/';


// ✅ Ensure Mongo URI exists
if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined. Check your .env file.');
  process.exit(1);
}

// ✅ Middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true, // Allow cookies/auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import Routes
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require("./routes/contactRoutes"); 
const paymentRoutes = require('./routes/paymentRoutes');
const receiptRoutes = require('./routes/receiptRoutes'); 
const plan = require('./routes/planRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ NEW: admin panel API
const service = require('./routes/servicesRoutes')

// ✅ Mount Routes
app.use('/user', userRoutes);         // Auth, profile, getAll (admin protected)
app.use("/contact", contactRoutes);   // User contact form
app.use('/payment', paymentRoutes);   // Payment-related APIs
app.use('/receipt', receiptRoutes);   // Invoice / PDF preview
app.use('/plan', plan);   // View/update services
app.use('/admin', adminRoutes);       // ✅ Admin dashboard metrics or control
app.use('/services', service); // ✅ NEW: services API

// ✅ Connect to MongoDB and Start Server (Updated)
mongoose
  .connect(MONGO_URI) // 🛠️ Removed deprecated options
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
