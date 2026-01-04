const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

/* ===============================
   GET ALL ACTIVE ROOMS
================================ */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error("GET ROOMS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   CREATE ROOM
================================ */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      roomType,          // ✅ ADDED
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

    // debug: log files received and body keys
    console.log("CREATE ROOM - FILES RECEIVED:", req.files ? req.files.length : 0, req.files ? req.files.map(f => f.originalname) : []);
    console.log("CREATE ROOM - BODY KEYS:", Object.keys(req.body));

    // ✅ VALIDATION
    if (
      !title ||
      !roomType ||
      !size ||
      !capacity ||
      !bedType ||
      !availableRooms ||
      !standardRate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // safety: do not allow more than 5 files in creation
    if (req.files && req.files.length > 5) return res.status(400).json({ message: "Maximum 5 images allowed per room" });

    const room = await Room.create({
      title,
      description,
      roomType, // ✅ SAVED
      size: Number(size),
      capacity: Number(capacity),
      bedType,
      availableRooms: Number(availableRooms),

      images: req.files && req.files.length ? req.files.map(f => `uploads/${f.filename}`) : [],

      rates: {
        planName: planName || "Standard Plan",
        inclusions: inclusions
          ? inclusions.split(",").map(i => i.trim())
          : [],
        depositPolicy,
      },

      pricing: {
        standardRate: Number(standardRate),
        currency: currency || "INR",
      },

      amenities: amenities
        ? amenities.split(",").map(a => a.trim())
        : [],

      status: "active",
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("CREATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   UPDATE ROOM
================================ */
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    // load existing room so we can append/remove images
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // debug: log files received and body keys
    console.log("UPDATE ROOM - FILES RECEIVED:", req.files ? req.files.length : 0, req.files ? req.files.map(f => f.originalname) : []);
    console.log("UPDATE ROOM - BODY KEYS:", Object.keys(req.body));

    // enforce maximum images per room
    const existingCount = (room.images || []).length;
    const newCount = req.files ? req.files.length : 0;
    if (existingCount + newCount > 5) {
      // remove newly uploaded files to avoid orphan files
      if (req.files && req.files.length) {
        req.files.forEach(f => {
          try {
            const fp = path.join(__dirname, "..", "uploads", f.filename);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
          } catch (e) {
            console.error("Failed to cleanup uploaded file:", e);
          }
        });
      }
      return res.status(400).json({ message: "Maximum 5 images allowed per room. Remove some existing images before adding new ones." });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      roomType: req.body.roomType, // ✅ ADDED
      size: req.body.size ? Number(req.body.size) : undefined,
      capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
      bedType: req.body.bedType,
      availableRooms: req.body.availableRooms
        ? Number(req.body.availableRooms)
        : undefined,

      amenities: req.body.amenities
        ? req.body.amenities.split(",").map(a => a.trim())
        : undefined,

      rates: req.body.planName
        ? {
            planName: req.body.planName,
            inclusions: req.body.inclusions
              ? req.body.inclusions.split(",").map(i => i.trim())
              : [],
            depositPolicy: req.body.depositPolicy,
          }
        : undefined,

      pricing: req.body.standardRate
        ? {
            standardRate: Number(req.body.standardRate),
            currency: req.body.currency || "INR",
          }
        : undefined,
    };

    // append newly uploaded images
    if (req.files && req.files.length) {
      const newImages = req.files.map(f => `uploads/${f.filename}`);
      updateData.images = (room.images || []).concat(newImages);
    }

    // remove any images requested for deletion (client may send JSON array in removeImages)
    if (req.body.removeImages) {
      try {
        const toRemove = JSON.parse(req.body.removeImages);
        // filter them out
        updateData.images = (updateData.images || room.images || []).filter(img => !toRemove.includes(img));
        // delete files from disk
        toRemove.forEach(img => {
          const filePath = path.join(__dirname, "..", img);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, err => { if (err) console.error("Failed to delete image file:", err); });
          }
        });
      } catch (e) {
        console.warn("Invalid removeImages payload", e);
      }
    }

    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   DELETE SINGLE IMAGE FROM ROOM
================================ */
router.delete("/:id/images", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Image path required" });
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.images = (room.images || []).filter(i => i !== image);
    await room.save();

    const filePath = path.join(__dirname, "..", image);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, err => { if (err) console.error("Failed to delete image file:", err); });
    }

    res.json({ success: true, images: room.images });
  } catch (err) {
    console.error("DELETE ROOM IMAGE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   SOFT DELETE ROOM
================================ */
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
