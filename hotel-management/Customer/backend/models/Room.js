const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    // ✅ ROOM TYPE (FIXED OPTIONS)
    roomType: {
      type: String,
      required: true,
      enum: ["Single", "Double", "Deluxe", "Suite", "Family"]
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    // ✅ SINGLE IMAGE
    image: {
      type: String // stores image path/url
    },

    amenities: {
      type: [String],
      default: []
    },

    // ✅ AVAILABLE ROOMS COUNT
    stock: {
      type: Number,
      required: true,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
