const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const Task = require("../models/Task");
const Booking = require("../models/Booking"); // if exists

router.get("/dashboard", async (req, res) => {
  try {
    const availableRooms = await Room.countDocuments({
      AvailabilityStatus: "Available",
      isActive: true
    });

    const activeGuests = await Booking.countDocuments({
      bookingStatus: "CheckedIn"
    });

    const checkInsToday = await Booking.countDocuments({
      checkIn: {
        $gte: new Date(new Date().setHours(0, 0, 0))
      }
    });

    const pendingTasks = await Task.countDocuments({
      status: "Pending"
    });

    res.json({
      availableRooms,
      checkInsToday,
      activeGuests,
      pendingTasks,
      occupancy: 82 // can be calculated later
    });
  } catch (err) {
    res.status(500).json({ message: "Staff dashboard error" });
  }
});

module.exports = router;
