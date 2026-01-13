const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

/* ======================================================
   GET ALL ROOMS (ADMIN)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error("ADMIN GET ROOMS ERROR:", err);
    res.status(500).json({ message: "Failed to load rooms" });
  }
});

/* ======================================================
   CREATE ROOM (ADMIN)
====================================================== */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      roomType,
      size,
      capacity,
      bedType,
      totalRooms,
      amenities,
      planName,
      inclusions,
      depositPolicy,
      standardRate,
      currency,
    } = req.body;

    // ✅ Validation
    if (
      !title ||
      !roomType ||
      !capacity ||
      !bedType ||
      !totalRooms ||
      !standardRate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await Room.create({
      title,
      description,
      roomType,
      size: size ? Number(size) : undefined,
      capacity: Number(capacity),
      bedType,
      totalRooms: Number(totalRooms),

      images: req.files?.map((f) => `uploads/${f.filename}`) || [],

      amenities: amenities
        ? amenities.split(",").map((a) => a.trim())
        : [],

      rates: {
        planName: planName || "Standard Plan",
        inclusions: inclusions
          ? inclusions.split(",").map((i) => i.trim())
          : [],
        depositPolicy,
      },

      pricing: {
        standardRate: Number(standardRate),
        currency: currency || "INR",
      },

      status: "active",
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("ADMIN CREATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   UPDATE ROOM (ADMIN)
====================================================== */
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ Image limit check
    const existingImages = room.images?.length || 0;
    const newImages = req.files?.length || 0;

    if (existingImages + newImages > 5) {
      req.files?.forEach((f) => {
        const fp = path.join(__dirname, "..", "uploads", f.filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
      return res.status(400).json({ message: "Max 5 images allowed" });
    }

    // ✅ Append images
    if (req.files?.length) {
      room.images.push(...req.files.map((f) => `uploads/${f.filename}`));
    }

    // ✅ Remove images
    if (req.body.removeImages) {
      const removeList = JSON.parse(req.body.removeImages);
      room.images = room.images.filter((img) => !removeList.includes(img));

      removeList.forEach((img) => {
        const fp = path.join(__dirname, "..", img);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
    }

    // ✅ Update fields
    room.title = req.body.title ?? room.title;
    room.description = req.body.description ?? room.description;
    room.roomType = req.body.roomType ?? room.roomType;
    room.size = req.body.size ? Number(req.body.size) : room.size;
    room.capacity = req.body.capacity
      ? Number(req.body.capacity)
      : room.capacity;
    room.bedType = req.body.bedType ?? room.bedType;
    room.totalRooms = req.body.totalRooms
      ? Number(req.body.totalRooms)
      : room.totalRooms;

    if (req.body.amenities) {
      room.amenities = req.body.amenities
        .split(",")
        .map((a) => a.trim());
    }

    if (req.body.standardRate) {
      room.pricing = {
        standardRate: Number(req.body.standardRate),
        currency: req.body.currency || "INR",
      };
    }

    if (req.body.planName) {
      room.rates = {
        planName: req.body.planName,
        inclusions: req.body.inclusions
          ? req.body.inclusions.split(",").map((i) => i.trim())
          : [],
        depositPolicy: req.body.depositPolicy,
      };
    }

    await room.save();
    res.json(room);
  } catch (err) {
    console.error("ADMIN UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   DELETE ROOM IMAGE (ADMIN)
====================================================== */
router.delete("/:id/images", async (req, res) => {
  try {
    const { image } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.images = room.images.filter((img) => img !== image);
    await room.save();

    const fp = path.join(__dirname, "..", image);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    res.json({ success: true, images: room.images });
  } catch (err) {
    console.error("ADMIN DELETE IMAGE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   SOFT DELETE ROOM (ADMIN)
====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { status: "inactive" });
    res.json({ success: true, message: "Room deactivated" });
  } catch (err) {
    console.error("ADMIN DELETE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
