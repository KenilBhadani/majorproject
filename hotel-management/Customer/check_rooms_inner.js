
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Assuming we run this from inside Customer directory
const connectDB = async () => {
    try {
        const MONGO_URI = "mongodb+srv://Kenil_bhadani:Kenil2006@hotel-management.ooudlle.mongodb.net/hotelDB"; 
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");
        
        // Adjust path to model
        const RoomListing = require('./backend/models/RoomListing');
        
        const rooms = await RoomListing.find({});
        console.log("\n--- ROOM STATUS REPORT ---");
        rooms.forEach(r => {
            console.log(`Title: ${r.title} | Type: ${r.roomType} | Status: ${r.status} | ID: ${r._id}`);
        });
        console.log("--------------------------\n");
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
