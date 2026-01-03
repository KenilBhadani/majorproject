const mongoose = require("mongoose");

/* =========================
   BOOKING MODEL
========================= */
const BookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "RoomListing" },
    roomType: { type: String },
    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    mobileNo: { type: String },
    checkIn: { type: Date },
    checkOut: { type: Date },
    pricePerNight: { type: Number },
    totalNights: { type: Number },
    totalAmount: { type: Number },
    paymentStatus: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Pending" },
    bookingStatus: { type: String, enum: ["Upcoming", "Checked-in", "Completed", "Cancelled"], default: "Upcoming" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema, "bookings");