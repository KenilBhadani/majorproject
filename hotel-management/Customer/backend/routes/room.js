const express = require("express");
const router = express.Router();
const RoomListing = require("../models/RoomListing");
const Booking = require("../models/Booking");

/* =========================
   GET ALL ROOMS
========================= */
router.get("/", async (req, res) => {
  try {
    const rooms = await RoomListing.find({ status: "active" });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

/* =========================
   GET AVAILABLE ROOMS (FIXED)
========================= */
router.get("/available", async (req, res) => {
  try {
    const { roomType, guests, checkIn, checkOut } = req.query;

    // Frontend → DB mapping
    const roomTypeMap = {
      single: "Single",
      double: "Double",
      deluxe: "Deluxe",
      suite: "Suite",
      family: "Family",
    };

    const normalizedRoomType = roomTypeMap[roomType?.toLowerCase()];

    let query = { status: "active" };

    if (normalizedRoomType) {
      query.roomType = normalizedRoomType;
    }

    if (guests) {
      query.capacity = { $gte: Number(guests) };
    }

    const rooms = await RoomListing.find(query);

    // If no dates → return all rooms
    if (!checkIn || !checkOut) {
      return res.json(rooms);
    }

    const availableRooms = [];

    for (const room of rooms) {
      // ✅ COUNT BOOKINGS BY ROOM TYPE (NOT _id)
      const overlappingBookings = await Booking.countDocuments({
        roomType: room.roomType,
        bookingStatus: { $in: ["Upcoming", "Checked-in"] },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      });

      const remaining = room.availableRooms - overlappingBookings;

      if (remaining > 0) {
        availableRooms.push({
          ...room.toObject(),
          availableCount: remaining,
        });
      }
    }

    res.json(availableRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

module.exports = router;
