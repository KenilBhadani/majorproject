const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const RoomListing = require("../models/RoomListing");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   AUTH MIDDLEWARE (FIXED)
========================= */
const authMiddleware = (req, res, next) => {
  if (req.session?.user) {
    req.user = {
      userId: req.session.user.id,
      email: req.session.user.email,
      role: req.session.user.role,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
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
   GET USER BOOKINGS (FIXED)
========================= */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(req.user.userId),
    })
      .populate("roomId")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error("FETCH BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* =========================
   SAVE BOOKING (DATE-BASED)
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
      paymentMethod,
      paymentIntentId,
    } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const room = await RoomListing.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const totalRooms = room.totalRooms || 1;

    const overlappingCount = await Booking.countDocuments({
      roomId,
      status: { $ne: "Cancelled" },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (overlappingCount >= totalRooms) {
      return res
        .status(400)
        .json({ error: "No rooms available for selected dates" });
    }

    let userId = null;
    if (req.session?.user) userId = req.session.user.id;
    else if (req.headers.authorization) {
      try {
        userId = jwt.verify(
          req.headers.authorization.split(" ")[1],
          process.env.JWT_SECRET
        ).userId;
      } catch {}
    }

    const booking = await Booking.create({
      roomId,
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

      checkIn: start,
      checkOut: end,

      paymentIntentId: paymentIntentId || null,
      paymentStatus: paymentMethod === "CASH" ? "Cash" : "Pending",
      status: paymentMethod === "CASH" ? "Confirmed" : "Pending",

      userId,
    });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("SAVE BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

/* =========================
   VERIFY STRIPE PAYMENT
========================= */
router.post("/verify-payment", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const booking = await Booking.findOneAndUpdate(
      { paymentIntentId },
      { paymentStatus: "Paid", status: "Confirmed" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

/* =========================
   CANCEL BOOKING
========================= */
router.put("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.status === "Cancelled") {
      return res.status(400).json({ error: "Invalid booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ error: "Cancel failed" });
  }
});

module.exports = router;
