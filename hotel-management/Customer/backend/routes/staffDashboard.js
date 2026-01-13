const express = require("express");
const router = express.Router();
const Room = require("../models/RoomListing");
const Task = require("../models/Task");
const Booking = require("../models/Booking"); // if exists
const verifyStaff = require("../middleware/verifyStaff");

router.get("/dashboard", verifyStaff, async (req, res) => {
  try {
    const availableRooms = await Room.countDocuments({
      AvailabilityStatus: "Available",
      isActive: true
    });

    const activeGuests = await Booking.countDocuments({
      bookingStatus: "Checked-in"
    });

    const checkInsToday = await Booking.countDocuments({
      actualCheckIn: {
        $gte: new Date(new Date().setHours(0, 0, 0))
      }
    });

    const pendingTasks = await Task.countDocuments({
      status: "Pending"
    });

    res.json({
      availableRooms,
      checkInsToday,
      activeGuests,
      pendingTasks,
      occupancy: 82 // can be calculated later
    });
  } catch (err) {
    res.status(500).json({ message: "Staff dashboard error" });
  }
});

// GET bookings - staff can list bookings
router.get('/bookings', verifyStaff, async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).populate('roomId');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load bookings' });
  }
});

// PUT /bookings/:id/:action - checkin|checkout|cancel by Receptionist / Manager
router.put('/bookings/:id/:action', verifyStaff, async (req, res) => {
  try {
    const { id, action } = req.params;
    console.log(`[STAFF ACTION] staffId=${req.user.id} role=${req.user.role} action=${action} bookingId=${id}`);
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Not found' });

    const mapping = {
      checkin: 'Checked-in',
      checkout: 'Checked-out',
      cancel: 'Cancelled'
    };

    if (!mapping[action]) return res.status(400).json({ message: 'Unknown action' });

    // Authorization and per-action logic
    if (action === 'checkin') {
      // Only Receptionist may check in
      if (req.user.role !== 'Receptionist') return res.status(403).json({ message: 'Only Receptionist may perform check-in' });

      // Ensure not already checked-in
      if (booking.bookingStatus === 'Checked-in') return res.status(400).json({ message: 'Already checked-in' });

      const now = new Date();

      // If booking has a room, attempt an atomic decrement to avoid races and negative counts
      if (booking.roomId) {
        try {
          const decRes = await Room.updateOne({ _id: booking.roomId, availableRooms: { $gt: 0 } }, { $inc: { availableRooms: -1 } });
          if (decRes.modifiedCount === 0) {
            return res.status(400).json({ message: 'No available rooms for this booking' });
          }
        } catch (e) {
          console.warn('Room availability atomic decrement failed', e.message);
          // Proceed to set booking but warn – this avoids blocking check-ins due to a transient room update error
        }
      } else {
        console.warn('Booking has no roomId, skipping room availability update', booking._id);
      }

      // Update booking using partial update (avoid full validation failures)
      await Booking.updateOne({ _id: booking._id }, {
        $set: { bookingStatus: 'Checked-in', actualCheckIn: now },
        $push: { history: { action: 'checkin', by: req.user.id, note: `Checked in by ${req.user.role}`, createdAt: now } }
      });

    } else if (action === 'checkout') {
      // Only Receptionist may check out
      if (req.user.role !== 'Receptionist') return res.status(403).json({ message: 'Only Receptionist may perform check-out' });

      if (booking.bookingStatus !== 'Checked-in') return res.status(400).json({ message: 'Booking is not checked-in' });

      const now = new Date();

      await Booking.updateOne({ _id: booking._id }, {
        $set: { bookingStatus: 'Checked-out', actualCheckOut: now },
        $push: { history: { action: 'checkout', by: req.user.id, note: `Checked out by ${req.user.role}`, createdAt: now } }
      });

      if (booking.roomId) {
        try {
          // increment and then clamp to totalRooms when possible
          await Room.updateOne({ _id: booking.roomId }, { $inc: { availableRooms: 1 } });
          const roomAfter = await Room.findById(booking.roomId).select('availableRooms totalRooms');
          if (roomAfter && typeof roomAfter.totalRooms === 'number' && roomAfter.availableRooms > roomAfter.totalRooms) {
            await Room.updateOne({ _id: booking.roomId }, { $set: { availableRooms: roomAfter.totalRooms } });
          }
        } catch (e) {
          console.warn('Room availability increment failed', e.message);
        }
      } else {
        console.warn('Booking has no roomId, skipping room availability update', booking._id);
      }

    } else if (action === 'cancel') {
      // Cancellation allowed for Receptionist or Manager
      if (!['Receptionist', 'Manager'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
      await Booking.updateOne({ _id: booking._id }, {
        $set: { bookingStatus: 'Cancelled' },
        $push: { history: { action: 'cancel', by: req.user.id, note: `Cancelled by ${req.user.role}`, createdAt: new Date() } }
      });
    }

    // fetch updated booking to return
    const updatedBooking = await Booking.findById(booking._id).populate('roomId');

    console.log(`[STAFF ACTION] booking ${id} status -> ${updatedBooking.bookingStatus}`);

    // notify guest via email about status change
    try {
      const sendEmail = require('../utils/sendEmail');
      if (updatedBooking && updatedBooking.email) {
        await sendEmail({
          to: updatedBooking.email,
          subject: `Booking ${action} - ${updatedBooking._id}`,
          html: `<p>Your booking has been <strong>${updatedBooking.bookingStatus}</strong>. If you have questions please contact us.</p>`
        });
      }
    } catch (e) {
      console.error('Guest email failed', e.message);
    }

    res.json({ success: true, message: `Booking ${action} completed`, booking: updatedBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Action failed' });
  }
});

// GET /panel - aggregated data for staff panel (dashboard + lists)
router.get('/panel', verifyStaff, async (req, res) => {
  try {
    // Dashboard stats
    const availableRooms = await Room.countDocuments({
      status: 'active'
    });

    const activeGuests = await Booking.countDocuments({
      bookingStatus: 'Checked-in'
    });

    const checkInsToday = await Booking.countDocuments({
      checkIn: {
        $gte: new Date(new Date().setHours(0, 0, 0))
      }
    });

    const pendingTasks = await Task.countDocuments({
      status: 'Pending'
    });

    // Lists
    const rooms = await Room.find({ status: 'active' }).limit(200);
    const bookings = await Booking.find({}).sort({ checkIn: 1 }).limit(200).populate('roomId');
    const tasks = await Task.find({}).sort({ createdAt: -1 }).limit(200);



    // derive guest list from bookings
    const guestDocs = await Booking.find({}).select('firstName lastName phone email checkIn checkOut bookingStatus').limit(200);
    const guests = guestDocs.map(b => ({
      _id: b._id,
      name: `${b.firstName || ''} ${b.lastName || ''}`.trim(),
      phone: b.phone || b.mobileNo || '',
      email: b.email || '',
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      bookingStatus: b.bookingStatus || b.status || ''
    }));

    res.json({
      stats: { availableRooms, checkInsToday, activeGuests, pendingTasks, occupancy: Math.round((activeGuests / Math.max(1, availableRooms)) * 100) },
      rooms,
      bookings,
      tasks,
      guests
    });
  } catch (err) {
    console.error('STAFF PANEL ERROR', err);
    res.status(500).json({ message: 'Failed to load panel data' });
  }
});

// Provide a lightweight rooms endpoint as well
router.get('/rooms', verifyStaff, async (req, res) => {
  try {
    const r = await Room.find({ status: 'active' }).limit(500);
    res.json(r.map(rr => ({ ...rr.toObject(), roomStatus: rr.roomStatus || rr.status })));
  } catch (err) {
    console.error('GET ROOMS ERROR', err);
    res.status(500).json({ message: 'Failed to load rooms' });
  }
});

// PATCH room status (Housekeeping / Manager)
router.patch('/rooms/:id', verifyStaff, async (req, res) => {
  try {
    if (!['Housekeeping', 'Manager'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status required' });
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.roomStatus = status;
    await room.save();
    res.json({ success: true, room });
  } catch (err) {
    console.error('PATCH ROOM ERROR', err);
    res.status(500).json({ message: 'Failed to update room' });
  }
});

module.exports = router;
