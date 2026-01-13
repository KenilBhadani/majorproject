const express = require("express");
const router = express.Router();
const RoomListing = require("../models/RoomListing");
const Booking = require("../models/Booking");

/* =========================
   GET ALL ACTIVE ROOMS
   /api/rooms
========================= */
router.get("/", async (req, res) => {
  try {
    const rooms = await RoomListing.find({ status: "active" });
    res.json(Array.isArray(rooms) ? rooms : []);
  } catch (err) {
    console.error("Get rooms error:", err);
    res.json([]); // always array
  }
});

/* =========================
   GET AVAILABLE ROOMS (DATE-BASED)
   /api/rooms/available
========================= */
router.get("/available", async (req, res) => {
  try {
    const { roomType, guests, checkIn, checkOut } = req.query;

    /* ---------- VALIDATION ---------- */
    if (!checkIn || !checkOut) return res.json([]);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      isNaN(checkInDate.getTime()) ||
      isNaN(checkOutDate.getTime()) ||
      checkInDate >= checkOutDate
    ) {
      return res.json([]);
    }

    /* ---------- ROOM TYPE NORMALIZATION ---------- */
    const roomTypeMap = {
      single: "Single",
      double: "Double",
      deluxe: "Deluxe",
      suite: "Suite",
      family: "Family",
    };

    const normalizedRoomType =
      roomType && roomTypeMap[roomType.toLowerCase()];

    /* ---------- BASE ROOM QUERY ---------- */
    const roomQuery = { status: "active" };

    if (normalizedRoomType) {
      roomQuery.roomType = normalizedRoomType;
    }

    if (guests) {
      roomQuery.capacity = { $gte: Number(guests) };
    }

    const rooms = await RoomListing.find(roomQuery);
    if (!rooms.length) return res.json([]);

    /* ---------- FETCH OVERLAPPING BOOKINGS (ONCE) ---------- */
    const overlappingBookings = await Booking.aggregate([
      {
        $match: {
          status: "Confirmed",
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      },
      {
        $group: {
          _id: "$roomId",
          bookedCount: { $sum: 1 },
        },
      },
    ]);

    /* ---------- MAP BOOKINGS ---------- */
    const bookingMap = {};
    overlappingBookings.forEach((b) => {
      bookingMap[b._id.toString()] = b.bookedCount;
    });

    /* ---------- CALCULATE AVAILABILITY ---------- */
    const availableRooms = rooms
      .map((room) => {
        // hard safety check
        if (typeof room.totalRooms !== "number") return null;

        const bookedCount = bookingMap[room._id.toString()] || 0;
        const availableCount = room.totalRooms - bookedCount;

        if (availableCount <= 0) return null;

        return {
          ...room.toObject(),
          availableCount, // computed, frontend-only
        };
      })
      .filter(Boolean);

    res.json(availableRooms);
  } catch (err) {
    console.error("Available rooms error:", err);
    res.json([]); // always array
  }
});

module.exports = router;
