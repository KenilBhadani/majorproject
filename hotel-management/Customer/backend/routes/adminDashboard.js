const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Room = require("../models/RoomListing");

/* ======================
   DASHBOARD OVERVIEW
====================== */
router.get("/overview", async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const roomsAvailable = await Room.countDocuments({
      status: "active",
      availableRooms: { $gt: 0 }
    });

    res.json({
      totalBookings,
      roomsAvailable,
      sparklineBookings: [] // you can add analytics later
    });
  } catch (err) {
    console.error("OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
});

/* ======================
   RECENT BOOKINGS
====================== */
router.get("/recent-bookings", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("roomId", "title roomType");

    res.json({ bookings });
  } catch (err) {
    console.error("RECENT BOOKINGS ERROR:", err);
    res.status(500).json({ bookings: [] });
  }
});

module.exports = router;
