const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

/* ================================
   PAYMENT SUMMARY (MONTH AWARE)
================================ */
router.get("/summary", async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM

    if (!month) {
      return res.status(400).json({ message: "Month required" });
    }

    const [year, mon] = month.split("-").map(Number);

    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);

    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end }
    });

    let totalRevenue = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    bookings.forEach(b => {
      totalRevenue += b.totalAmount || 0;
      if (b.paymentStatus === "Paid") paidAmount += b.totalAmount || 0;
      if (b.paymentStatus === "Pending") pendingAmount += b.totalAmount || 0;
    });

    res.json({
      totalRevenue,
      paidAmount,
      pendingAmount,
      totalBookings: bookings.length
    });
  } catch (err) {
    res.status(500).json({ message: "Payment summary error" });
  }
});

/* ================================
   PAYMENT TRANSACTIONS LIST
================================ */
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select(
        "firstName lastName totalAmount paymentStatus bookingStatus createdAt"
      );

    res.json(transactions);
  } catch {
    res.status(500).json({ message: "Failed to load transactions" });
  }
});

module.exports = router;
