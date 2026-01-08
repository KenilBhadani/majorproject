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

// ✅ FIXED CORS (prevents HTML response issue)
app.use(
  cors({
    origin: true, // allows localhost:3000 safely
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
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
app.use("/api/staff/auth", require("./routes/staffAuth"));
app.use("/api/admin/staff", require("./routes/adminStaff"));

// Admin Users
app.use("/api/admin/users", require("./routes/adminUsers"));

// Bookings & Payments
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/admin/payments", require("./routes/adminPayments"));

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

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Stripe payment failed" });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (_req, res) => {
  res.send("✅ Hotel API running");
});

/* =========================
   API 404 HANDLER (IMPORTANT)
========================= */
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
