const mongoose = require("mongoose");

/* Rate Schema */
const RateSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true, trim: true },
    inclusions: { type: [String], default: [] },
    depositPolicy: { type: String, trim: true },
  },
  { _id: false }
);

/* Pricing Schema */
const PricingSchema = new mongoose.Schema(
  {
    standardRate: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
  },
  { _id: false }
);

/* Room Listing Schema */
const RoomListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
        roomType: {
      type: String,
      required: true,
      enum: ["Single", "Double", "Deluxe", "Suite", "Family"]
    },
    capacity: { type: Number, required: true, min: 1 },
    bedType: { type: String, required: true },
    availableRooms: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    rates: RateSchema,
    pricing: PricingSchema,
    amenities: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.RoomListing ||
  mongoose.model("RoomListing", RoomListingSchema, "rooms");
