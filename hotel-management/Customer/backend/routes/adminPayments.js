const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");

// admin verification middleware
function verifyAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const token = auth.replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (!data || data.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    req.user = { id: data.userId, role: data.role };
    next();
  } catch (err) {
    console.error("verifyAdmin error", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

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
      // prefer `amount` (newer field), fall back to `totalAmount` for backwards compat
      const amt = (b.amount != null) ? b.amount : (b.totalAmount || 0);
      totalRevenue += amt;
      if (b.paymentStatus === "Paid") paidAmount += amt;
      if (b.paymentStatus === "Pending") pendingAmount += amt;
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
    const docs = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("firstName lastName amount totalAmount paymentStatus bookingStatus createdAt");

    // normalize field name to `totalAmount` expected by frontend
    const transactions = docs.map(d => ({
      _id: d._id,
      firstName: d.firstName,
      lastName: d.lastName,
      totalAmount: (d.amount != null) ? d.amount : (d.totalAmount || 0),
      paymentStatus: d.paymentStatus,
      bookingStatus: d.bookingStatus,
      createdAt: d.createdAt
    }));

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load transactions" });
  }
});

/* ================================
   PAYMENT STATUS DISTRIBUTION
   GET /api/admin/payments/status-distribution?month=YYYY-MM&by=amount|count
================================ */
router.get("/status-distribution", async (req, res) => {
  try {
    const { month, by = "amount" } = req.query; // by=amount|count

    let match = {};
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    }

    const groupStage = {
      _id: "$paymentStatus",
    };

    if (by === "amount") {
      groupStage.total = { $sum: { $ifNull: ["$amount", "$totalAmount", 0] } };
    } else {
      groupStage.total = { $sum: 1 };
    }

    const agg = await Booking.aggregate([
      { $match: match },
      { $group: groupStage }
    ]);

    // produce consistent keys
    const result = agg.reduce((acc, cur) => {
      acc[cur._id || "Unknown"] = cur.total;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    console.error("status-distribution error", err);
    res.status(500).json({ message: "Failed to compute distribution" });
  }
});

/* ================================
   PAYMENT TRENDS
   GET /api/admin/payments/trends?days=30&by=amount
================================ */
router.get("/trends", async (req, res) => {
  try {
    const days = Math.min(180, Number(req.query.days) || 30);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const agg = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: "Paid" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: { $ifNull: ["$amount", "$totalAmount", 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ days, start: start.toISOString(), end: end.toISOString(), series: agg });
  } catch (err) {
    console.error("trends error", err);
    res.status(500).json({ message: "Failed to load trends" });
  }
});

/* ================================
   VERIFY & SYNC SINGLE BOOKING
   (checks Stripe PaymentIntent and updates booking)
================================ */
router.put("/verify/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!booking.paymentIntentId) return res.status(400).json({ message: "No paymentIntentId on booking" });

    // retrieve payment intent from Stripe
    const pi = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

    // Stripe amounts are in smallest currency unit (paise)
    const stripeAmount = (pi.amount != null) ? (pi.amount / 100) : null;

    if (pi.status === "succeeded") {
      booking.paymentStatus = "Paid";
      // prefer amount if present, otherwise use Stripe amount
      booking.totalAmount = booking.amount != null ? booking.amount : (stripeAmount || booking.totalAmount);
      await booking.save();
      return res.json({ success: true, booking, stripeStatus: pi.status });
    }

    // for other statuses mark pending (or leave as-is)
    booking.paymentStatus = pi.status === "requires_payment_method" ? "Pending" : booking.paymentStatus;
    if (stripeAmount && !booking.totalAmount) booking.totalAmount = stripeAmount;
    await booking.save();

    res.json({ success: true, booking, stripeStatus: pi.status });
  } catch (err) {
    console.error("verify booking error", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
