const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Room = require("../models/RoomListing");

/* ============================================================
   1. CREATE STRIPE CHECKOUT SESSION 
   (जब यूजर 'Confirm Booking' बटन दबाएगा, तब यह कॉल होगा)
============================================================ */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { bookingPayload } = req.body;

    // डेटा की जाँच करें
    if (!bookingPayload.room || !bookingPayload.totalAmount) {
      return res.status(400).json({ message: "Missing required booking data" });
    }

    const roomData = await Room.findById(bookingPayload.room);
    if (!roomData || roomData.stock <= 0) {
      return res.status(400).json({ message: "Room is no longer available" });
    }

    // Stripe Session Create करें
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: roomData.title,
              description: `Booking for ${bookingPayload.totalNights} night(s) - ${bookingPayload.firstName} ${bookingPayload.lastName}`,
            },
            unit_amount: Math.round(bookingPayload.totalAmount * 100), // Paise में कन्वर्ट करें
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/bookingformpage`,
      metadata: {
        // Metadata में डेटा सेव करना बहुत ज़रूरी है ताकि पेमेंट के बाद इस्तेमाल हो सके
        ...bookingPayload,
        roomType: roomData.title // roomType की समस्या हल करने के लिए
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    res.status(500).json({ message: "Could not initiate payment" });
  }
});

/* ============================================================
   2. CONFIRM AND SAVE BOOKING 
   (पेमेंट सफल होने के बाद Success.js पेज इसे कॉल करेगा)
============================================================ */
router.post("/confirm-booking", async (req, res) => {
  try {
    const { session_id } = req.body;

    // Stripe से सेशन की जानकारी लें
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not verified" });
    }

    const data = session.metadata;

    // डेटाबेस में नई बुकिंग बनाएँ
    const newBooking = new Booking({
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNo: data.mobileNo,
      gstNo: data.gstNo || null,
      specialRequest: data.specialRequest || null,
      room: data.room,
      roomType: data.roomType,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      pricePerNight: Number(data.pricePerNight),
      totalNights: Number(data.totalNights),
      totalAmount: Number(data.totalAmount),
      paymentStatus: "Paid",
      bookingStatus: "Upcoming"
    });

    await newBooking.save();

    // रूम का स्टॉक कम करें
    await Room.findByIdAndUpdate(data.room, { $inc: { stock: -1 } });

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error("Confirm Booking Error:", err);
    res.status(500).json({ message: "Failed to save booking to database" });
  }
});

/* ============================================================
   3. ADMIN ROUTES (DASHBOARD & REPORTS)
============================================================ */

// GET ALL BOOKINGS
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ isActive: true })
      .populate("room", "title")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

// DASHBOARD OVERVIEW
router.get("/overview", async (req, res) => {
  try {
    const { month } = req.query; // Format: YYYY-MM
    if (!month) return res.status(400).json({ message: "Month is required" });

    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59);

    const monthlyBookings = await Booking.find({
      isActive: true,
      checkIn: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const roomsAvailable = await Room.countDocuments({ stock: { $gt: 0 } });

    res.json({
      totalBookings: monthlyBookings.length,
      roomsAvailable,
      bookingsThisMonth: monthlyBookings.length
    });
  } catch (err) {
    res.status(500).json({ message: "Overview error" });
  }
});

module.exports = router;