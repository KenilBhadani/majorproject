require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");

const app = express();

/* ================================
   MIDDLEWARE
================================ */
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   MONGODB CONNECTION
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

/* ================================
   STATIC UPLOADS
================================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================================
   ROUTES REGISTRATION
================================ */

// 1. Room Routes
const adminRooms = require("./routes/adminRooms");
const roomRoutes = require("./routes/room");
app.use("/api/rooms", roomRoutes);
app.use("/api/admin/rooms", adminRooms);
app.use("/api/public/rooms", roomRoutes);

// 2. Auth Routes
app.use("/api/auth", authRoutes);

// 3. Staff & Admin Staff Routes
const staffDashboard = require("./routes/staffDashboard");
const adminStaffRoutes = require("./routes/adminStaff");
const staffAuth = require("./routes/staffAuth");
app.use("/api/staff", staffDashboard);
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/staff/auth", staffAuth);

// 4. Booking & Stripe Payment Routes (UPDATED)
// यहाँ adminBookings.js को रजिस्टर किया गया है जिसमें Stripe के लॉजिक्स हैं
const adminBookings = require("./routes/adminBookings");
app.use("/api/admin/bookings", adminBookings);

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => res.status(200).send("✅ Hotel Management API is running with Stripe Integration"));

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));