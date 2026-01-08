const mongoose = require("mongoose");

/* =========================
   BOOKING MODEL
========================= */
const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "RoomListing", required: true },
  roomTitle: String,
  ratePerNight: Number,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  gst: String,
  requests: String,
  paymentIntentId: { type: String },
  amount: { type: Number, required: true },
  subtotal: Number,
  gstAmount: Number,
  nights: Number,
  checkIn: Date,
  checkOut: Date,
  // Associate booking to a user when available
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Booking status for management and cancellation
  status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Confirmed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
