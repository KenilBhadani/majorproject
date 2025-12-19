const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

/**
 * GET all active rooms
 */
router.get("/", async (req, res) => {
  try {
    console.log("GET rooms called"); // 🔴
    const rooms = await Room.find({ isActive: true });
    console.log("Rooms found:", rooms.length); // 🔴
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * CREATE room
 * Prevent duplicate rooms with same title + roomType
 */
router.post("/", async (req, res) => {
  try {
    const existing = await Room.findOne({
      title: req.body.title,
      roomType: req.body.roomType
    });

    if (existing) {
      return res.status(400).json({
        message: "Room with same title and type already exists"
      });
    }

    const room = await Room.create(req.body);
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * UPDATE room
 * Prevent duplicate title + roomType on edit
 */
router.put("/:id", async (req, res) => {
  try {
    const duplicate = await Room.findOne({
      title: req.body.title,
      roomType: req.body.roomType,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Room with same title and type already exists"
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * SOFT DELETE room
 */
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
