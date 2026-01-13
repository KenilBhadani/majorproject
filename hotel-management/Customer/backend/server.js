// =======================================
// server.js – Hotel Management Backend
// =======================================

// 1️⃣ Load environment variables first
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 2️⃣ Initialize Express app
const app = express();

// 3️⃣ Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
const { MongoStore } = require('connect-mongo');

// 4️⃣ Session & Passport initialization
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 5️⃣ Debug Google OAuth env variables (optional)
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

// 6️⃣ Load Passport strategies
require("./config/passport"); // Make sure this file uses process.env variables correctly

// 7️⃣ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 8️⃣ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    // Ensure rooms have availableRooms initialized
    try {
      const RoomListing = require('./models/RoomListing');
      const rooms = await RoomListing.find({});
      for (const r of rooms) {
        try {
          if (typeof r.totalRooms !== 'number') {
            console.warn(`Room ${r._id} missing totalRooms — skipping availableRooms init`);
            continue;
          }

          // compute a desired availableRooms value and clamp into [0, totalRooms]
          let desiredAvailable = (typeof r.availableRooms === 'number') ? r.availableRooms : r.totalRooms;
          if (desiredAvailable < 0 || desiredAvailable > r.totalRooms) desiredAvailable = r.totalRooms;

          if (typeof r.availableRooms !== 'number' || r.availableRooms !== desiredAvailable) {
            r.availableRooms = desiredAvailable;
            await r.save();
          }
        } catch (innerErr) {
          console.warn(`Skipping room ${r._id} due to save error: ${innerErr.message}`);
        }
      }
      console.log('✅ Room availability initialized');
    } catch (e) {
      console.error('Failed initializing room availability', e.message);
    }
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 9️⃣ Routes
app.use("/api/auth", require("./routes/auth")); // Local + Google
app.use("/api/rooms", require("./routes/room"));
app.use("/api/admin/rooms", require("./routes/adminRooms"));
app.use("/api/staff", require("./routes/staffDashboard"));
app.use("/api/staff/auth", require("./routes/staffAuth"));
app.use("/api/staff/tasks", require("./routes/staffTasks"));
app.use("/api/admin/staff", require("./routes/adminStaff"));
app.use("/api/admin/users", require("./routes/adminUsers"));
app.use("/api/admin/bookings", require("./routes/adminBookings"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/admin/payments", require("./routes/adminPayments"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/subscribe", require("./routes/subscribe"));

// 10️⃣ Stripe payment intent
app.post("/api/bookings/create-payment-intent", async (req, res) => {
  try {
    const { amount, bookingData } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        email: bookingData?.email || "guest@example.com",
        roomId: bookingData?.roomId || "",
        name: `${bookingData?.firstName || ""} ${bookingData?.lastName || ""}`
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Stripe payment failed" });
  }
});

// 11️⃣ Health check
app.get("/", (_req, res) => res.send("✅ Hotel API running"));

// 12️⃣ 404 handler for API
app.use("/api/*", (_req, res) => res.status(404).json({ error: "API route not found" }));

// 13️⃣ Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// 14️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
