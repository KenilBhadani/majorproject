const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Review = require("../models/Review");

/* =========================
   SUBMIT REVIEW
========================= */
router.post("/review", async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Find the booking to get roomId
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const review = new Review({
      bookingId,
      roomId: booking.roomId,
      rating,
      comment,
      userEmail: booking.email,
    });

    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    console.error("Review submission error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;
