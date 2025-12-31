const express = require("express");
const router = express.Router();
const RoomListing = require("../models/RoomListing");

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
   GET AVAILABLE ROOMS (FILTER)
========================= */
router.get("/available", async (req, res) => {
  try {
    const { roomType, guests } = req.query;

    // 🔁 map frontend value → DB enum
    const roomTypeMap = {
      single: "Single",
      double: "Double",
      deluxe: "Deluxe",
      suite: "Suite",
      family: "Family",
    };

    const normalizedRoomType = roomTypeMap[roomType?.toLowerCase()];

    if (!normalizedRoomType) {
      return res.json([]);
    }

    const rooms = await RoomListing.find({
      roomType: normalizedRoomType,
      capacity: { $gte: Number(guests || 1) },
      status: "active",
    });

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

module.exports = router;
