require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI) // removed deprecated options
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   ROUTES
========================= */
// Auth
app.use("/api/auth", require("./routes/auth"));

// Rooms
app.use("/api/rooms", require("./routes/room"));
app.use("/api/admin/rooms", require("./routes/adminRooms"));

// Staff & Admin
app.use("/api/staff", require("./routes/staffDashboard"));
app.use("/api/admin/staff", require("./routes/adminStaff"));
app.use("/api/staff/auth", require("./routes/staffAuth"));

// Admin Users
app.use("/api/admin/users", require("./routes/adminUsers"));

// Admin Bookings & Payments
app.use("/api/admin/payments", require("./routes/adminPayments"));
app.use("/api/bookings", require("./routes/booking"));

/* =========================
   STRIPE – PAYMENT INTENT
========================= */
app.post("/api/bookings/create-payment-intent", async (req, res) => {
  try {
    const { amount, bookingData } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // INR → paise
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        email: bookingData?.email || "guest@example.com",
        roomId: bookingData?.roomId || "",
        name: `${bookingData?.firstName || ""} ${bookingData?.lastName || ""}`,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error.message, error.raw || "");
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (_req, res) => {
  res.send("✅ Hotel API running");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
