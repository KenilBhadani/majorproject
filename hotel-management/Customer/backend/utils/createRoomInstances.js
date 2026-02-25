// utils/createRoomInstances.js
const RoomInstance = require("../models/RoomInstance");
const RoomListing = require("../models/RoomListing");

async function createRoomInstancesForListing(roomListingId, totalRooms) {
  try {
    const roomListing = await RoomListing.findById(roomListingId);
    if (!roomListing) {
        console.error("RoomListing not found for instance creation");
        return;
    }

    const prefix = roomListing.roomType ? roomListing.roomType.charAt(0).toUpperCase() : 'R';
    const roomInstances = [];

    for (let i = 1; i <= totalRooms; i++) {
      roomInstances.push({
        roomListing: roomListingId,
        roomNumber: `${i}`, // Simple sequential numbers 1, 2, 3...
        status: "FREE",
      });
    }

    await RoomInstance.insertMany(roomInstances);
    console.log(`${totalRooms} RoomInstances created for listing ${roomListingId}`);
  } catch (err) {
    console.error("Error creating RoomInstances:", err);
  }
}

module.exports = createRoomInstancesForListing;
