const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const upload = require("../middleware/upload");

/* ===============================
   GET ALL ACTIVE ROOMS
================================ */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   CREATE ROOM (WITH IMAGE)
================================ */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { title, roomType } = req.body;

    if (!title || !roomType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔒 Prevent duplicate room
    const existing = await Room.findOne({ title, roomType });
    if (existing) {
      return res.status(400).json({
        message: "Room with same title and type already exists"
      });
    }

    const room = await Room.create({
      title: req.body.title,
      description: req.body.description || "",
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      capacity: Number(req.body.capacity),
      stock: Number(req.body.stock),
      amenities: req.body.amenities
        ? req.body.amenities.split(",").map(a => a.trim())
        : [],
      image: req.file ? `/uploads/rooms/${req.file.filename}` : "",
      isActive: true
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   UPDATE ROOM (IMAGE OPTIONAL)
================================ */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, roomType } = req.body;

    if (!title || !roomType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔒 Prevent duplicate on edit
    const duplicate = await Room.findOne({
      title,
      roomType,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Room with same title and type already exists"
      });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description || "",
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      capacity: Number(req.body.capacity),
      stock: Number(req.body.stock),
      amenities: req.body.amenities
        ? req.body.amenities.split(",").map(a => a.trim())
        : []
    };

    // 🖼️ Replace image only if new uploaded
    if (req.file) {
      updateData.image = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(room);
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   SOFT DELETE ROOM
================================ */
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
