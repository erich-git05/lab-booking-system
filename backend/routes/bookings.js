const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');

// Get all bookings for the current user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('equipment', 'name description image')
      .sort({ date: -1, startTime: -1 });
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { equipmentId, quantity, startDate, endDate } = req.body;

    // Check if equipment exists and has enough availability
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }

    if (equipment.available < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough equipment available'
      });
    }

    // Check for booking overlaps (optional: implement if needed)
    // const hasOverlap = await Booking.checkOverlap(equipmentId, startDate, endDate);
    // if (hasOverlap) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Time slot overlaps with existing booking'
    //   });
    // }

    // Create booking
    const booking = new Booking({
      userId: req.user.id,
      equipmentId,
      quantity,
      startDate,
      endDate,
      status: 'pending'
    });

    // Update equipment availability
    await equipment.updateAvailability(-quantity);

    const newBooking = await booking.save();
    await newBooking.populate('equipment', 'name description image');

    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.body.status) {
      booking.status = req.body.status;
    }

    // Handle equipment availability based on status change
    const equipment = await Equipment.findById(booking.equipment);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }

    if (booking.status === 'cancelled' && booking.status !== 'cancelled') {
      // Return equipment to available pool
      await equipment.updateAvailability(booking.quantity);
    } else if (booking.status === 'completed' && booking.status === 'confirmed') {
      // Return equipment to available pool
      await equipment.updateAvailability(booking.quantity);
    }

    const updatedBooking = await booking.save();
    await updatedBooking.populate('equipment', 'name description image');

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('equipment', 'name description image');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized to view the booking
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

// Delete a booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.remove();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 