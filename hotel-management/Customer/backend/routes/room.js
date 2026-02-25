const express = require("express");
const router = express.Router();

const RoomListing = require("../models/RoomListing");
const Booking = require("../models/Booking");
const RoomInstance = require("../models/RoomInstance");

/* =========================
   GET ALL ACTIVE ROOMS
   Guest / Reception
   /api/rooms
========================= */
router.get("/", async (req, res) => {
  try {
    const rooms = await RoomListing.find({ status: "active" }).lean();

    // Populate RoomInstances (roomNumbers) for frontend
    for (let room of rooms) {
      const instances = await RoomInstance.find({ roomListing: room._id }).lean();
      room.roomNumbers = instances;
    }

    res.json(Array.isArray(rooms) ? rooms : []);
  } catch (err) {
    console.error("Get rooms error:", err);
    res.json([]);
  }
});

/* =========================
   GET AVAILABLE ROOMS (DATE-BASED)
   Guest booking flow
   /api/rooms/available
========================= */
router.get("/available", async (req, res) => {
  try {
    const { roomType, guests, checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) return res.json([]);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
      return res.json([]);
    }

    const roomTypeMap = {
      single: "Single",
      double: "Double",
      deluxe: "Deluxe",
      suite: "Suite",
      family: "Family",
    };
    const normalizedRoomType = roomType && roomTypeMap[roomType.toLowerCase()];

    const roomQuery = { status: "active" };
    if (normalizedRoomType) roomQuery.roomType = normalizedRoomType;
    if (guests) roomQuery.capacity = { $gte: Number(guests) };

    const rooms = await RoomListing.find(roomQuery).lean();
    if (!rooms.length) return res.json([]);

    // Overlapping bookings
    const overlappingBookings = await Booking.aggregate([
      {
        $match: {
          bookingStatus: { $nin: ["Cancelled", "Checked-out"] },
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
    const bookingMap = {};
    overlappingBookings.forEach(b => { bookingMap[b._id.toString()] = b.bookedCount; });

    // Attach roomNumbers and calculate availability
    const availableRooms = [];
    for (let room of rooms) {
      const bookedCount = bookingMap[room._id.toString()] || 0;
      // We rely on date-based availability (inventory), not physical status (housekeeping)
      // because physical status is transient and 'STAY' is already covered by overlappingBookings.
      const availableCount = room.totalRooms - bookedCount;

      if (availableCount <= 0) continue;

      const instances = await RoomInstance.find({ roomListing: room._id }).lean();
      room.roomNumbers = instances;

      availableRooms.push({
        ...room,
        availableRooms: availableCount,
      });
    }

    res.json(availableRooms);

  } catch (err) {
    console.error("Available rooms error:", err);
    res.json([]);
  }
});

module.exports = router;
