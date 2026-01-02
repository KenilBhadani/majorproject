const express = require("express");
const router = express.Router();
const stripe = require("stripe")("YOUR_STRIPE_SECRET_KEY"); // अपनी Secret Key यहाँ डालें
const Booking = require("../models/Booking"); //
const Room = require("../models/RoomListing"); //

/* ==============================================
   1. CREATE STRIPE CHECKOUT SESSION
   (पेमेंट लिंक जनरेट करने के लिए)
============================================== */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { bookingPayload } = req.body;

    const roomData = await Room.findById(bookingPayload.room);
    if (!roomData || !roomData.isActive || roomData.stock <= 0) {
      return res.status(400).json({ message: "Room not available" });
    }

    // Stripe Session बनाना
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: roomData.title,
              description: `${bookingPayload.roomType} - ${bookingPayload.totalNights} Night(s)`,
            },
            unit_amount: bookingPayload.totalAmount * 100, // Stripe paise/cents में अमाउंट लेता है
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/bookingformpage`,
      metadata: {
        // यहाँ बुकिंग का सारा डेटा अस्थायी रूप से सेव करें
        ...bookingPayload 
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stripe connection failed" });
  }
});

/* ==============================================
   2. FINAL BOOKING (After Payment Success)
   (पेमेंट के बाद डेटाबेस में एंट्री के लिए)
============================================== */
router.post("/confirm-booking", async (req, res) => {
  try {
    const { session_id } = req.body;
    
    // Stripe से पेमेंट की पुष्टि करें
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not verified" });
    }

    // Metadata से डेटा निकालें
    const data = session.metadata;

    // डेटाबेस में बुकिंग बनाएँ
    const booking = await Booking.create({
      ...data,
      paymentStatus: "Paid",
      bookingStatus: "Upcoming"
    });

    // स्टॉक कम करें
    await Room.findByIdAndUpdate(data.room, { $inc: { stock: -1 } });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save booking" });
  }
});

/* ==============================================
   EXISTING ROUTES (DASHBOARD & ADMIN)
============================================== */

// GET ALL BOOKINGS
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

// RECENT BOOKINGS
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

// DASHBOARD OVERVIEW
router.get("/overview", async (req, res) => {
  try {
    const { month } = req.query; 
    if (!month) return res.status(400).json({ message: "Month is required" });

    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59);

    const monthlyBookings = await Booking.find({
      isActive: true,
      checkIn: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalBookings = monthlyBookings.length;
    const roomsAvailable = await Room.countDocuments({ stock: { $gt: 0 } });

    res.json({
      totalBookings,
      roomsAvailable,
      bookingsThisMonth: totalBookings,
      // ... अन्य डेटा यहाँ जोड़ सकते हैं
    });
  } catch (err) {
    res.status(500).json({ message: "Overview error" });
  }
});

// STATUS UPDATES
router.put("/bookings/:id/checkin", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: "Checked-in" });
  res.json({ success: true });
});

router.put("/bookings/:id/checkout", async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: "Checked-out" });
  res.json({ success: true });
});

module.exports = router;