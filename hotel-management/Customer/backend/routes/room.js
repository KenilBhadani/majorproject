const express = require("express");
const router = express.Router();
const RoomListing = require("../models/RoomListing");
const Booking = require("../models/Booking");

/* =========================
   GET ALL ROOMS (UNCHANGED)
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
   GET AVAILABLE ROOMS (UPDATED)
========================= */
router.get("/available", async (req, res) => {
  try {
    const { roomType, guests, checkIn, checkOut } = req.query;

    // Frontend → DB mapping (UNCHANGED)
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

    // ✅ UPDATE: projection added (NO LOGIC REMOVED)
    const rooms = await RoomListing.find(
      query,
      {
        title: 1,
        description: 1,
        roomType: 1,
        images: 1,
        amenities: 1,
        pricing: 1,
        availableRooms: 1,
        status: 1,
      }
    );

    // ✅ SAME BEHAVIOR AS BEFORE
    if (!checkIn || !checkOut) {
      return res.json(
        rooms.map(room => ({
          ...room.toObject(),
          availableCount: room.availableRooms, // added safely
        }))
      );
    }

    const availableRooms = [];

    for (const room of rooms) {
      // EXISTING LOGIC (UNCHANGED)
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
          availableCount: remaining, // ✅ added field
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
