const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const upload = require("../middleware/upload");

/* GET all active rooms */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error("GET ROOMS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* CREATE room */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      size,
      capacity,
      bedType,
      availableRooms,
      amenities,
      planName,
      inclusions,
      depositPolicy,
      standardRate,
      currency,
    } = req.body;

    if (!title || !description || !size || !capacity || !bedType || !availableRooms || !standardRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await Room.create({
      title,
      description,
      size: Number(size),
      capacity: Number(capacity),
      bedType,
      availableRooms: Number(availableRooms),
      images: req.file ? [`uploads/${req.file.filename}`] : [],
      rates: {
        planName: planName || "Standard Plan",
        inclusions: inclusions
          ? Array.isArray(inclusions)
            ? inclusions
            : inclusions.split(",").map(i => i.trim())
          : [],
        depositPolicy,
      },
      pricing: {
        standardRate: Number(standardRate),
        currency: currency || "INR",
      },
      amenities: amenities
        ? Array.isArray(amenities)
          ? amenities
          : amenities.split(",").map(a => a.trim())
        : [],
      status: "active",
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE room */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      size: req.body.size ? Number(req.body.size) : undefined,
      capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
      bedType: req.body.bedType,
      availableRooms: req.body.availableRooms ? Number(req.body.availableRooms) : undefined,
      amenities: req.body.amenities
        ? Array.isArray(req.body.amenities)
          ? req.body.amenities
          : req.body.amenities.split(",").map(a => a.trim())
        : undefined,
      rates: req.body.planName
        ? {
            planName: req.body.planName,
            inclusions: req.body.inclusions
              ? Array.isArray(req.body.inclusions)
                ? req.body.inclusions
                : req.body.inclusions.split(",").map(i => i.trim())
              : [],
            depositPolicy: req.body.depositPolicy,
          }
        : undefined,
      pricing: req.body.standardRate
        ? { standardRate: Number(req.body.standardRate), currency: req.body.currency || "INR" }
        : undefined,
    };

    if (req.file) updateData.images = [`uploads/${req.file.filename}`];

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(room);
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* SOFT DELETE room */
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { status: "inactive" });
    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    console.error("DELETE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
