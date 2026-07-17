
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'Customer/.env') }); // Try root .env or similar
// If that fails, hardcode or try another path. 
// The user has e:\Running\Hotel\hotel-management\Customer\backend\.env likely?
// Let's try to find where .env is.

// Actually, I can just look at how server.js connects.
const connectDB = async () => {
    try {
        // Assuming standard mongo url if .env fails
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel_management"; 
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");
        
        const RoomListing = require('./Customer/backend/models/RoomListing');
        
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
