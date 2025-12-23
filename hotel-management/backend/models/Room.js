const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, required: true },
      image: {
    type: String // will store image URL/path
  },

    amenities: [{ type: String }],

    stock: { type: Number, required: true, min: 0 }, // ✅

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
