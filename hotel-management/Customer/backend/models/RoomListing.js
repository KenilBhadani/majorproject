const mongoose = require("mongoose");

const RoomListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    roomType: {
      type: String,
      enum: ["Single", "Double", "Deluxe", "Suite", "Family"],
      required: true,
    },

    size: Number,
    capacity: Number,
    bedType: String,

    // ✅ Used for date-based availability
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    images: [String],

    rates: {
      planName: String,
      inclusions: [String],
      depositPolicy: String,
    },

    pricing: {
      standardRate: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },

    amenities: [String],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.RoomListing ||
  mongoose.model("RoomListing", RoomListingSchema);
