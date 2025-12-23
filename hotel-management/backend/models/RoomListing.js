const mongoose = require("mongoose");
const { GiStockpiles } = require("react-icons/gi");

const RoomListingSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['Single', 'Double', 'Suite', 'Deluxe']
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
    images: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    AvailabilityStatus: {
        type: String,
        required: true,
        enum: ['Available', 'Booked', 'Maintenance'],
        default: 'Available'
    },
    isactive: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("RoomListing", RoomListingSchema);

