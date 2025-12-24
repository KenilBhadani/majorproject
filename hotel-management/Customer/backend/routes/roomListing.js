const express = require("express");
const RoomListing = require("../models/RoomListing"); // Ensure path is correct
const router = express.Router();

/* ============== CREATE ROOM LISTING ============== */
router.post("/", async (req, res) => {
  try {
    const roomData = req.body;
    const newRoom = new RoomListing(roomData);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============== GET ALL ROOM LISTINGS ============== */
router.get("/", async (req, res) => {
  try {
    console.log("Fetching rooms..."); 
    
    // FIXED: Changed query to { isActive: true } (Capital A)
    const rooms = await RoomListing.find({ isActive: true });
    
    console.log("Rooms found:", rooms); 

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============== UPDATE ROOM LISTING ============== */     
router.put("/:id", async (req, res) => {
  try {
    const roomId = req.params.id;
    const updateData = req.body;
    
    const updatedRoom = await RoomListing.findByIdAndUpdate(roomId, updateData, { new: true });
    
    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============== DELETE ROOM LISTING ============== */
router.delete("/:id", async (req, res) => {
  try { 
    const roomId = req.params.id;
    const deletedRoom = await RoomListing.findByIdAndDelete(roomId);
    
    if (!deletedRoom) {
        return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;