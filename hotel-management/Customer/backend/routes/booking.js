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
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* =========================
   GET USER BOOKINGS
========================= */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { userId: new mongoose.Types.ObjectId(req.user.userId) },
        { email: req.user.email },
      ],
    })
      .populate("roomId")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* =========================
   SAVE BOOKING (FIXED)
========================= */
router.post("/save", async (req, res) => {
  try {
    const {
      bookingData,
      roomId,
      nights,
      subtotal,
      gstAmount,
      amount,
      checkIn,
      checkOut,
      paymentStatus,
      paymentIntentId,
    } = req.body;

    // 🔐 Optional login
    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {}
    }

    const booking = new Booking({
      roomId: new mongoose.Types.ObjectId(roomId),

      roomTitle: bookingData.roomTitle,
      ratePerNight: bookingData.ratePerNight,

      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      email: bookingData.email,
      phone: bookingData.phone,
      gst: bookingData.gst,
      requests: bookingData.requests,

      nights,
      subtotal,
      gstAmount,
      amount,

      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),

      paymentIntentId: paymentIntentId || null,
      status: paymentStatus === "PAID" ? "Confirmed" : "Pending",
      userId,
    });

    await booking.save();

    res.json({
      success: true,
      message: "Booking saved successfully",
      booking,
    });
  } catch (err) {
    console.error("SAVE BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

module.exports = router;
