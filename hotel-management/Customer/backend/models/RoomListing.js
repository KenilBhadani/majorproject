const mongoose = require("mongoose");

/* =========================
   BOOKING SCHEMA
========================= */
const BookingSchema = new mongoose.Schema(
  {
    roomType: {
      type: String,
      required: true,
      enum: ["Single", "Double", "Deluxe", "Suite", "Family"],
    },

    roomTitle: {
      type: String,
      trim: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["Upcoming", "Checked-in", "Completed", "Cancelled"],
      default: "Upcoming",
    },

    guests: {
      type: Number,
      min: 1,
    },

    totalAmount: {
      type: Number,
      min: 0,
    },

    customerName: {
      type: String,
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* =========================
   EXPORT MODEL (IMPORTANT)
========================= */
module.exports =
  mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema, "bookings");

  