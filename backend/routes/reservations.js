const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// Get all reservations (with authentication)
router.get('/', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('itemId')
      .populate('userId', 'username email');
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Get reservation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('itemId')
      .populate('userId', 'username email');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Error fetching reservation' });
  }
});

// Create new reservation
router.post('/', auth, async (req, res) => {
  try {
    const reservation = new Reservation({
      ...req.body,
      userId: req.user.id
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

// Update reservation
router.put('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user owns the reservation or is a lab assistant
    if (reservation.userId.toString() !== req.user.id && req.user.role !== 'lab-assistant') {
      return res.status(403).json({ message: 'Not authorized to update this reservation' });
    }
    
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('itemId').populate('userId', 'username email');
    
    res.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
});

// Delete reservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user owns the reservation or is a lab assistant
    if (reservation.userId.toString() !== req.user.id && req.user.role !== 'lab-assistant') {
      return res.status(403).json({ message: 'Not authorized to delete this reservation' });
    }
    
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
});

// Bulk create reservations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { items } = req.body;
    const results = [];

    for (const { itemId, quantity, date } of items) {
      const reservation = new Reservation({
        userId: req.user.id,
        itemId,
        quantity,
        date
      });
      await reservation.save();
      results.push(reservation);
    }

    res.status(201).json(results);
  } catch (error) {
    console.error('Error creating bulk reservations:', error);
    res.status(500).json({ message: 'Error creating bulk reservations' });
  }
});

module.exports = router;