const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Add new item (lab assistant only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is lab assistant
        if (req.user.role !== 'lab-assistant') {
            return res.status(403).json({ message: 'Only lab assistants can add items' });
        }

        const newItem = new Item({
            ...req.body,
            addedBy: req.user.id
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Error adding item' });
    }
});

// Update item (lab assistant only)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is lab assistant
        if (req.user.role !== 'lab-assistant') {
            return res.status(403).json({ message: 'Only lab assistants can update items' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Error updating item' });
    }
});

// Delete item (lab assistant only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is lab assistant
        if (req.user.role !== 'lab-assistant') {
            return res.status(403).json({ message: 'Only lab assistants can delete items' });
        }

        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Error deleting item' });
    }
});

module.exports = router;