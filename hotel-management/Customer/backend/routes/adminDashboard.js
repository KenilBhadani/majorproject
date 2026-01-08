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

    // Return most recent non-cancelled bookings. Note: booking schema uses `roomId`.
    const bookings = await Booking.find({ bookingStatus: { $ne: "Cancelled" } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("roomId", "title roomType");

    const formatted = bookings.map((b) => ({
      _id: b._id,
      guestName: `${b.firstName || ""} ${b.lastName || ""}`.trim(),
      roomName: b.roomId?.title || b.roomTitle || "—",
      roomType: b.roomId?.roomType || b.roomType || "—",
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      bookingStatus: b.bookingStatus || "—"
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error("RECENT BOOKINGS ERROR:", err);
    res.status(500).json({ bookings: [] });
  }
});

/* ======================
   STATS & TRENDS
====================== */

// GET /api/admin/stats - basic aggregates
router.get("/stats", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const totalBookings = await Booking.countDocuments();

    // revenue today (paid bookings created today)
    const revenueTodayResult = await Booking.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenueToday = (revenueTodayResult[0] && revenueTodayResult[0].total) || 0;

    // revenue this month
    const revenueMonthResult = await Booking.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenueMonth = (revenueMonthResult[0] && revenueMonthResult[0].total) || 0;

    const totalRooms = await Room.countDocuments({ status: "active" });

    // occupancy: count bookings active today (checkIn <= today < checkOut, and not cancelled)
    const now = new Date();
    const occupiedCount = await Booking.countDocuments({
      bookingStatus: { $ne: "Cancelled" },
      checkIn: { $lte: now },
      checkOut: { $gt: now }
    });

    const occupancy = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    res.json({
      totalBookings,
      revenueToday,
      revenueMonth,
      totalRooms,
      occupiedCount,
      occupancy
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// GET /api/admin/trends?days=30 - bookings & revenue by day for last N days
router.get("/trends", async (req, res) => {
  try {
    const days = Math.min(90, Number(req.query.days) || 30);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    // bookings per day
    const bookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // revenue per day (paid)
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ bookings, revenue, start: start.toISOString(), end: end.toISOString() });
  } catch (err) {
    console.error("TRENDS ERROR:", err);
    res.status(500).json({ message: "Failed to load trends" });
  }
});

/* ======================
   BOOKINGS STATUS DISTRIBUTION
   GET /api/admin/bookings/status-distribution?days=30
====================== */
router.get("/bookings/status-distribution", async (req, res) => {
  try {
    const days = Math.min(180, Number(req.query.days) || 30);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const agg = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = agg.reduce((acc, cur) => {
      acc[cur._id || "Unknown"] = cur.count;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    console.error("status distribution error", err);
    res.status(500).json({ message: "Failed to compute booking status distribution" });
  }
});

module.exports = router;
