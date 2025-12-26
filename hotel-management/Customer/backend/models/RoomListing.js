const mongoose = require("mongoose");

const RoomListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    roomType: {
      type: String,
      required: true,
      enum: ["Single", "Double", "Suite", "Deluxe", "erg"]
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    stock: { type: Number },
    image: { type: String }, // stored as public url path e.g. /uploads/filename
    amenities: [String],
    AvailabilityStatus: {
      type: String,
      enum: ["Available", "Booked", "Maintenance"],
      default: "Available"
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError in dev/hot-reload
module.exports =
  mongoose.models.Room ||
  mongoose.model("Room", RoomListingSchema, "rooms");