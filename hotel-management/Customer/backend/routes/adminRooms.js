const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const upload = require("../middleware/upload");

/* ===============================
   GET ALL ACTIVE ROOMS
================================ */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   CREATE ROOM
================================ */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, roomType } = req.body;

    if (!title || !roomType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Room.findOne({ title, roomType });
    if (existing) {
      return res.status(400).json({
        message: "Room with same title and type already exists"
      });
    }

    const room = await Room.create({
      title: req.body.title,
      description: req.body.description,
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      capacity: Number(req.body.capacity),
      stock: Number(req.body.stock),
      amenities: req.body.amenities
        ? req.body.amenities.split(",").map(a => a.trim())
        : [],
      image: req.file ? `/uploads/${req.file.filename}` : "",
      isActive: true
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   UPDATE ROOM
================================ */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      capacity: Number(req.body.capacity),
      stock: Number(req.body.stock),
      amenities: req.body.amenities
        ? req.body.amenities.split(",").map(a => a.trim())
        : []
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(room);
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   SOFT DELETE
================================ */
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
