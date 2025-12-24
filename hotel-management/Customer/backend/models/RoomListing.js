const mongoose = require("mongoose");

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
        // Added 'erg' so your existing data doesn't crash the app
        enum: ['Single', 'Double', 'Suite', 'Deluxe', 'erg']
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
    
    // Added 'stock' because it exists in your database
    stock: {
        type: Number
    },

    AvailabilityStatus: {
        type: String,
        // Removed 'required: true' because your current data is missing this field
        enum: ['Available', 'Booked', 'Maintenance'],
        default: 'Available'
    },
    
    // FIXED: Changed 'isactive' to 'isActive' (Capital A) to match your Database
    isActive: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);

// The 3rd argument "rooms" forces Mongoose to use your specific "rooms" collection
module.exports = mongoose.model("Room", RoomListingSchema, "rooms");