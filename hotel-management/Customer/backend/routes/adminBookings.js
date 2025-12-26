const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/RoomListing");

/* ================================
   CREATE BOOKING
================================ */
router.post("/bookings", async (req, res) => {
  try {
    const {
      title,
      firstName,
      lastName,
      email,
      mobileNo,
      gstNo,
      specialRequest,
      room,
      checkIn,
      checkOut
    } = req.body;

    const roomData = await Room.findById(room);
    if (!roomData || !roomData.isActive || roomData.stock <= 0) {
      return res.status(400).json({ message: "Room not available" });
    }

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const totalAmount = nights * roomData.pricePerNight;

    const booking = await Booking.create({
      title,
      firstName,
      lastName,
      email,
      mobileNo,
      gstNo,
      specialRequest,
      room,
      roomType: roomData.roomType,
      checkIn,
      checkOut,
      pricePerNight: roomData.pricePerNight,
      totalNights: nights,
      totalAmount
    });

    roomData.stock -= 1;
    await roomData.save();

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

/* ================================
   GET ALL BOOKINGS (ADMIN)
================================ */
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ isActive: true })
      .populate("room", "title roomType")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

/* ================================
   RECENT BOOKINGS (DASHBOARD)
================================ */
router.get("/recent-bookings", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const bookings = await Booking.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("room", "title roomType");

    const formatted = bookings.map(b => ({
      _id: b._id,
      guestName: `${b.firstName} ${b.lastName}`,
      roomName: b.room?.title,
      roomType: b.roomType,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.bookingStatus
    }));

    res.json({ bookings: formatted });
  } catch {
    res.status(500).json({ message: "Failed to load recent bookings" });
  }
});

/* ================================
   DASHBOARD OVERVIEW (CORRECT)
================================ */
router.get("/overview", async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const [year, mon] = month.split("-").map(Number);

    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59);

    /* ===== BOOKINGS IN SELECTED MONTH ===== */
    const monthlyBookings = await Booking.find({
      isActive: true,
      checkIn: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalBookings = monthlyBookings.length;

    /* ===== THIS WEEK (INSIDE SELECTED MONTH) =====
       Week = Monday → Sunday of TODAY,
       but clipped inside selected month
    */
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const bookedItemsThisWeek = monthlyBookings.filter(b =>
      b.checkIn >= weekStart && b.checkIn <= weekEnd
    ).length;

    /* ===== ROOMS AVAILABLE ===== */
    const roomsAvailable = await Room.countDocuments({
      stock: { $gt: 0 }
    });

    /* ===== SPARKLINE (DAY-WISE CHECK-IN) ===== */
    const sparklineBookings = [];
    const daysInMonth = new Date(year, mon, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(year, mon - 1, d);
      const dayEnd = new Date(year, mon - 1, d, 23, 59, 59);

      const count = monthlyBookings.filter(b =>
        b.checkIn >= dayStart && b.checkIn <= dayEnd
      ).length;

      sparklineBookings.push({
        day: dayStart.toISOString().split("T")[0],
        count
      });
    }

    res.json({
      totalBookings,
      percentChangeMonth: 0,
      bookingsThisMonth: totalBookings,
      bookedItemsThisWeek,
      roomsAvailable,
      sparklineBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Overview error" });
  }
});

/* ================================
   CHECK-IN / CHECK-OUT / CANCEL
================================ */
router.put("/bookings/:id/checkin", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, {
    bookingStatus: "Checked-in"
  });
  res.json({ success: true });
});

router.put("/bookings/:id/checkout", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, {
    bookingStatus: "Checked-out"
  });
  res.json({ success: true });
});

router.put("/bookings/:id/cancel", async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Not found" });

  booking.bookingStatus = "Cancelled";
  booking.isActive = false;
  await booking.save();

  await Room.findByIdAndUpdate(booking.room, { $inc: { stock: 1 } });
  res.json({ success: true });
});

module.exports = router;
