const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken");

/* =========================
   AUTH MIDDLEWARE
========================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { userId, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* =========================
   GET LOGGED-IN USER BOOKINGS
   GET /api/bookings/my
========================= */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { userId: req.user.userId },
        { email: req.user.email }
      ]
    })
      .populate("roomId") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    const formatted = bookings.map(b => ({
      _id: b._id,
      status: b.status,
      amount: b.amount,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,

      roomTitle: b.roomId?.title,
      roomImage: b.roomId?.images?.[0], // ✅ SAME AS BookingForm
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error("Fetch bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* =========================
   SEARCH BOOKINGS BY EMAIL (GUEST)
   GET /api/bookings/search?email=
========================= */
router.get("/search", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const bookings = await Booking.find({ email })
      .populate("roomId") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    const formatted = bookings.map(b => ({
      _id: b._id,
      status: b.status,
      amount: b.amount,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,

      roomTitle: b.roomId?.title,
      roomImage: b.roomId?.images?.[0],
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error("Search booking error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* =========================
   CANCEL BOOKING
========================= */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Cancel failed" });
  }
});

/* =========================
   SAVE BOOKING
========================= */
router.post("/save", async (req, res) => {
  try {
    const {
      bookingData,
      paymentStatus,
      paymentIntentId,
      roomId,
      ratePerNight,
      checkIn,
      checkOut,
      nights,
      subtotal,
      gst,
      amount,
    } = req.body;

    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {}
    }

    const booking = new Booking({
      roomId, // ✅ reference to Room
      ratePerNight,
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      email: bookingData.email,
      phone: bookingData.phone,
      gst: bookingData.gst,

      paymentIntentId,
      amount,
      subtotal,
      gstAmount: gst,
      nights,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      userId,
      status: paymentStatus === "PAID" ? "Confirmed" : "Pending",
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error("Save booking error:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

module.exports = router;
