const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');

// Helper to map equipment fields
function mapEquipment(equipment) {
  return {
    id: equipment._id,
    name: equipment.name,
    category: equipment.category,
    description: equipment.description,
    image: equipment.image,
    available: equipment.available,
    totalQuantity: equipment.totalQuantity,
    itemType: equipment.itemType
  };
}

// Get all equipment
router.get('/', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json({
      success: true,
      data: equipment.map(mapEquipment)
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment'
    });
  }
});

// Get single equipment
router.get('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }
    res.json({
      success: true,
      data: mapEquipment(equipment)
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment'
    });
  }
});

// Add new equipment (lab assistant only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab_assistant') {
      return res.status(403).json({
        success: false,
        error: 'Only lab assistants can add equipment'
      });
    }

    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json({
      success: true,
      data: mapEquipment(equipment)
    });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add equipment'
    });
  }
});

// Update equipment (lab assistant only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab_assistant') {
      return res.status(403).json({
        success: false,
        error: 'Only lab assistants can update equipment'
      });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: mapEquipment(equipment)
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update equipment'
    });
  }
});

// Delete equipment (admin and lab assistant)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'lab_assistant') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete equipment'
    });
  }

  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }
    res.json({
      success: true,
      data: mapEquipment(equipment)
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete equipment'
    });
  }
});

module.exports = router; 