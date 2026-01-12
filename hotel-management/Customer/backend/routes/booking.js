const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* =========================
   GET USER BOOKINGS (LOGGED IN)
========================= */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { userId: new mongoose.Types.ObjectId(req.user.userId) },
        { email: req.user.email }
      ]
    })
      .populate("roomId")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
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
    console.error("Fetch my bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* =========================
   SEARCH BOOKINGS (GUEST)
========================= */
router.get("/search", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const bookings = await Booking.find({ email, userId: null })
      .populate("roomId")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
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
    console.error("Guest search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* =========================
   CANCEL BOOKING
========================= */
router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    let query = { _id: id };

    if (token) {
      // Logged-in user: ensure booking belongs to them
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      query.$or = [
        { userId: new mongoose.Types.ObjectId(decoded.userId) }, // ✅ Use 'new'
        { email: decoded.email }
      ];
    } else {
      // Guest bookings only
      query.userId = null;
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found or unauthorized" });
    }

    if (booking.status.toLowerCase() === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

/* =========================
   SAVE BOOKING
========================= */
router.post("/save", async (req, res) => {
  try {
    const { bookingData, paymentStatus, roomId, amount, checkIn, checkOut, nights } = req.body;

    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    const booking = new Booking({
      ...req.body,
      roomId,
      userId,
      email: bookingData.email,
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      phone: bookingData.phone,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
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
