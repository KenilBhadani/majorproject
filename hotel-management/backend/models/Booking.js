const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    /* ===== GUEST DETAILS ===== */
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Ms"],
      required: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    mobileNo: {
      type: String,
      required: true
    },

    gstNo: {
      type: String,
      default: null
    },

    specialRequest: {
      type: String,
      default: null
    },

    /* ===== ROOM DETAILS ===== */
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    roomType: {
      type: String,
      required: true // e.g. Deluxe, AC, Suite
    },

    /* ===== BOOKING DETAILS ===== */
    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true
    },

    pricePerNight: {
      type: Number,
      required: true
    },

    totalNights: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    /* ===== STATUS ===== */
    bookingStatus: {
      type: String,
      enum: ["Upcoming", "Checked-in", "Checked-out", "Cancelled"],
      default: "Upcoming"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
