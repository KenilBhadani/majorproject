const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomListing",
    required: true,
  },

  roomTitle: String,
  ratePerNight: Number,

  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  gst: String,
  requests: String,

  nights: Number,
  subtotal: Number,
  gstAmount: Number,

  amount: {
    type: Number,
    required: true,
  },

  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },

  paymentIntentId: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
