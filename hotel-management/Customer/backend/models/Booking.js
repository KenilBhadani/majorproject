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
  paymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true },
  subtotal: Number,
  gstAmount: Number,
  nights: Number,
  checkIn: Date,
  checkOut: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
