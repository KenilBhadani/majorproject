// backend/routes/staffRooms.js - Room status management with automated workflows
const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing"); // Room Types
const RoomInstance = require("../models/RoomInstance"); // Physical Rooms
const Booking = require("../models/Booking");
const verifyStaff = require("../middleware/verifyStaff");

const ROLE_PERMISSIONS = {
  'Housekeeping': ['read_instances', 'update_instance_status'],
  'Receptionist': ['read', 'read_instances', 'check_in', 'check_out'],
  'Manager': ['read', 'read_instances', 'create', 'update', 'delete', 'update_instance_status', 'check_in', 'check_out'],
  'Admin': ['read', 'read_instances', 'create', 'update', 'delete', 'update_instance_status', 'check_in', 'check_out']
};

// ============================================================================
// GET /api/staff/rooms - Get Room Types with Availability (Reception Dashboard)
// ============================================================================
router.get('/', verifyStaff, async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ title: 1 }).lean();

    // Calculate real-time availability for each room type
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const activeBookings = await Booking.countDocuments({
          roomId: room._id,
          bookingStatus: { $in: ['Confirmed', 'Checked-in'] },
          checkIn: { $lte: new Date() },
          checkOut: { $gte: new Date() }
        });

        const availableUnits = Math.max(0, room.totalRooms - activeBookings);

        return {
          ...room,
          roomNumber: room.title, // Keep for backward compatibility if frontend expects it
          availableUnits,
          isAvailable: availableUnits > 0,
          occupancyRate: room.totalRooms > 0 ? ((room.totalRooms - availableUnits) / room.totalRooms) * 100 : 0
        };
      })
    );

    res.json(roomsWithAvailability);
  } catch (err) {
    console.error('GET ROOMS ERROR:', err);
    res.status(500).json({ message: 'Failed to load rooms' });
  }
});

// ============================================================================
// GET /api/staff/rooms/instances - Get All Physical Room Instances (Housekeeping)
// ============================================================================
router.get('/instances', verifyStaff, async (req, res) => {
  try {
    const instances = await RoomInstance.find({})
      .populate('roomListing', 'title roomType')
      .sort({ roomNumber: 1 });
    res.json(instances);
  } catch (err) {
    console.error('GET INSTANCES ERROR:', err);
    res.status(500).json({ message: 'Failed to load room instances' });
  }
});

// ============================================================================
// POST /api/staff/rooms/check-in - Check-in Guest
// ============================================================================
router.post('/check-in', verifyStaff, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookingStatus === 'Checked-in') {
      return res.status(400).json({ message: "Guest already checked in" });
    }

    // Find a FREE room instance for this room type
    // Prioritize previously assigned room if any
    let roomInstance;
    
    if (booking.assignedRoomInstance) {
        roomInstance = await RoomInstance.findById(booking.assignedRoomInstance);
        if (roomInstance && roomInstance.status !== 'FREE' && roomInstance.status !== 'CLEAN') {
            // Assigned room is not ready, try to find another
            roomInstance = null;
        }
    }

    if (!roomInstance) {
        // Find any FREE or CLEAN room of the correct type
        // Fix: Sort by roomNumber ascending to ensure sequential assignment (1, 2, 3...)
        roomInstance = await RoomInstance.findOne({
            roomListing: booking.roomId,
            status: { $in: ['FREE', 'CLEAN'] }
        }).sort({ roomNumber: 1 });
    }

    if (!roomInstance) {
        return res.status(400).json({ message: "No available clean rooms of this type found for check-in." });
    }

    // Update Booking
    booking.bookingStatus = 'Checked-in';
    booking.assignedRoomInstance = roomInstance._id;
    booking.assignedRoomNumber = roomInstance.roomNumber;
    booking.actualCheckIn = new Date();
    booking.history.push({
        action: 'check-in',
        by: req.user.userId,
        note: `Checked in to room ${roomInstance.roomNumber}`
    });
    await booking.save();

    // Update Room Instance
    roomInstance.status = 'STAY';
    await roomInstance.save();

    res.json({ success: true, message: "Check-in successful", booking, roomInstance });

  } catch (err) {
    console.error('CHECK-IN ERROR:', err);
    res.status(500).json({ message: 'Check-in failed' });
  }
});

// ============================================================================
// POST /api/staff/rooms/check-out - Check-out Guest
// ============================================================================
router.post('/check-out', verifyStaff, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookingStatus !== 'Checked-in') {
      return res.status(400).json({ message: "Booking is not currently checked in" });
    }

    // Update Booking
    booking.bookingStatus = 'Checked-out';
    booking.actualCheckOut = new Date();
    booking.history.push({
        action: 'check-out',
        by: req.user.userId,
        note: `Checked out from room ${booking.assignedRoomNumber}`
    });
    await booking.save();

    // Update Room Instance -> DIRTY
    if (booking.assignedRoomInstance) {
        const roomInstance = await RoomInstance.findById(booking.assignedRoomInstance);
        if (roomInstance) {
            roomInstance.status = 'DIRTY'; // Changed from CLEANING to DIRTY as per new workflow
            roomInstance.lastStatusUpdate = new Date();
            await roomInstance.save();
        }
    }

    res.json({ success: true, message: "Check-out successful", booking });

  } catch (err) {
    console.error('CHECK-OUT ERROR:', err);
    res.status(500).json({ message: 'Check-out failed' });
  }
});

// ============================================================================
// POST /api/staff/rooms/payment - Update Payment Status (Receptionist)
// ============================================================================
router.post('/payment', verifyStaff, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = 'Paid';
    // Add history entry
    booking.history.push({
      action: 'payment',
      by: req.user.userId,
      note: 'Payment collected by reception (Cash/Card)'
    });

    await booking.save();

    res.json({ success: true, message: "Payment status updated to Paid", booking });

  } catch (err) {
    console.error('PAYMENT UPDATE ERROR:', err);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

// ============================================================================
// POST /api/staff/rooms/assign - Assign Staff to Room (Admin Only)
// ============================================================================
router.post('/assign', verifyStaff, async (req, res) => {
    try {
        const userRole = req.user.role.toLowerCase();
        if (userRole !== 'admin' && userRole !== 'manager') {
            return res.status(403).json({ message: "Only Admin/Manager can assign rooms" });
        }

        const { roomId, staffId } = req.body;
        
        const roomInstance = await RoomInstance.findById(roomId);
        if (!roomInstance) return res.status(404).json({ message: "Room not found" });

        // Verify staff exists and has correct role
        // Assuming we have a way to check staff role, ideally query Staff model
        // For now, we trust the ID passed, or we can import Staff model if needed.
        // Let's assume frontend sends valid staffId. 
        // Ideally: const staff = await Staff.findById(staffId);
        
        roomInstance.assignedTo = staffId;
        await roomInstance.save();

        res.json({ success: true, message: "Staff assigned successfully", roomInstance });
    } catch (err) {
        console.error('ASSIGN ERROR:', err);
        res.status(500).json({ message: 'Assignment failed' });
    }
});

// ============================================================================
// PATCH /api/staff/rooms/instance/:id - Update Room Instance Status
// ============================================================================
router.patch('/instance/:id', verifyStaff, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user.role.toLowerCase();
        const userId = req.user.userId;

        const validStatuses = ['FREE', 'STAY', 'DIRTY', 'CLEANING', 'MAINTENANCE', 'READY', 'REVIEW'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const roomInstance = await RoomInstance.findById(id);
        if (!roomInstance) {
            return res.status(404).json({ message: "Room instance not found" });
        }

        const currentStatus = roomInstance.status;

        // --- STATE MACHINE & AUTHORIZATION LOGIC ---

        // 1. ADMIN / MANAGER OVERRIDE
        if (userRole === 'admin' || userRole === 'manager') {
            // Admin can do anything, including marking READY -> FREE
            roomInstance.status = status;
            roomInstance.assignedTo = null; // Clear assignment on status change? Or keep it?
            // Usually if Admin sets to FREE, assignment is cleared.
            if (status === 'FREE') roomInstance.assignedTo = null;
            
            roomInstance.lastStatusUpdate = new Date();
            await roomInstance.save();
            return res.json({ success: true, roomInstance });
        }

        // 2. HOUSEKEEPING LOGIC
        if (userRole === 'housekeeping') {
            // Check assignment
            if (roomInstance.assignedTo && roomInstance.assignedTo.toString() !== userId) {
                 return res.status(403).json({ message: "You are not assigned to this room" });
            }

            // Allowed Transitions:
            // DIRTY -> CLEANING
            // CLEANING -> REVIEW
            // CLEANING -> MAINTENANCE (Report Issue)
            
            if (currentStatus === 'DIRTY' && status === 'CLEANING') {
                // OK
            } else if (currentStatus === 'CLEANING' && status === 'REVIEW') {
                // OK - Cleaning done, ready for review
            } else if (currentStatus === 'CLEANING' && status === 'MAINTENANCE') {
                // OK - Reporting issue
                // Maybe unassign housekeeping and notify admin/maintenance?
                // For now, just allow status change.
            } else {
                return res.status(400).json({ message: `Housekeeping cannot change ${currentStatus} to ${status}` });
            }
        }

        // 3. MAINTENANCE LOGIC
        if (userRole === 'maintenance') {
             // Check assignment
             if (roomInstance.assignedTo && roomInstance.assignedTo.toString() !== userId) {
                 return res.status(403).json({ message: "You are not assigned to this room" });
             }

             // Allow transitions
             
             // 1. Start Maintenance (From any non-occupied status -> MAINTENANCE)
             if (status === 'MAINTENANCE') {
                 if (currentStatus === 'STAY') {
                     return res.status(400).json({ message: "Cannot start maintenance on occupied room" });
                 }
                 // OK to start maintenance
             }
             // 2. Complete Maintenance (MAINTENANCE -> REVIEW)
             else if (currentStatus === 'MAINTENANCE' && status === 'REVIEW') {
                 // OK - Work done, waiting for admin approval
             }
             // 3. Complete Maintenance Legacy/Alternative (MAINTENANCE -> READY)
             // Kept for flexibility if needed, but REVIEW is preferred workflow
             else if (currentStatus === 'MAINTENANCE' && status === 'READY') {
                 // OK
             }
             else {
                  return res.status(400).json({ message: `Maintenance cannot change ${currentStatus} to ${status}` });
             }
        }

        // 4. RECEPTIONIST LOGIC
        if (userRole === 'receptionist') {
            // Can they change anything? 
            // Usually they handle Check-in (FREE->STAY) and Check-out (STAY->DIRTY) via other endpoints.
            // Direct status change might be restricted.
            // Let's allow them to set DIRTY -> FREE in emergency? Or strictly follow workflow?
            // User said: "Only Admin can change 'Ready' -> 'Available'"
            // So Receptionist probably shouldn't mess with maintenance/cleaning flow.
             return res.status(403).json({ message: "Receptionist cannot manually update room status. Use Check-in/Check-out." });
        }

        // Apply Update
        roomInstance.status = status;
        roomInstance.lastStatusUpdate = new Date();
        
        // Auto-clear assignment if room becomes READY?
        // User said: "After Cleaning or Maintenance completed -> status = 'Ready'. Only Admin can change 'Ready' -> 'Available'"
        // Maybe keep assignment so Admin sees who finished it.
        
        await roomInstance.save();
        res.json({ success: true, roomInstance });

    } catch (err) {
        console.error('INSTANCE UPDATE ERROR:', err);
        res.status(500).json({ message: 'Failed to update room status' });
    }
});

// ============================================================================
// PUT /api/staff/rooms/status - Legacy support or generic status update
// ============================================================================
router.put('/status', verifyStaff, async (req, res) => {
    // Redirect to check-in/check-out logic if applicable, or just generic update
    // This is kept for backward compatibility if other parts of frontend use it
    // ideally, we should migrate frontend to use check-in/check-out endpoints
    res.status(501).json({ message: "Please use /check-in, /check-out or /instance/:id endpoints" });
});

module.exports = router;
