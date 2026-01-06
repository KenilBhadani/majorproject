const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Stripe = require("stripe");
const Booking = require("../models/Booking");
const RoomListing = require("../models/RoomListing"); // ✅ ADDED

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   CREATE PAYMENT INTENT
========================= */
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in paise
      currency: "inr",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

/* =========================
   SAVE BOOKING + REDUCE AVAILABLE ROOMS
========================= */
router.post("/save", async (req, res) => {
  try {
    const {
      bookingData,
      paymentIntentId,
      roomId,
      roomTitle,
      ratePerNight,
      checkIn,
      checkOut,
      nights,
      subtotal,
      gst,
      amount,
    } = req.body;

    if (!bookingData || !paymentIntentId || !roomId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /* =========================
       1️⃣ CHECK ROOM AVAILABILITY
    ========================= */
    const room = await RoomListing.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.availableRooms <= 0) {
      return res.status(400).json({ error: "Room is sold out" });
    }

    /* =========================
       2️⃣ SAVE BOOKING
    ========================= */
    const newBooking = new Booking({
      roomId,
      roomTitle: roomTitle || room.title,
      ratePerNight: ratePerNight || room.pricing.standardRate,
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      email: bookingData.email,
      phone: bookingData.phone,
      gst: bookingData.gst,
      requests: bookingData.requests,
      paymentIntentId,
      amount,
      subtotal,
      gstAmount: gst,
      nights,
      checkIn,
      checkOut,
    });

    const savedBooking = await newBooking.save();

    /* =========================
       3️⃣ REDUCE AVAILABLE ROOMS
    ========================= */
    room.availableRooms = room.availableRooms - 1;
    await room.save();

    res.status(201).json({
      success: true,
      booking: savedBooking,
      remainingRooms: room.availableRooms,
    });
  } catch (err) {
    console.error("Booking Save Error:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

module.exports = router;
