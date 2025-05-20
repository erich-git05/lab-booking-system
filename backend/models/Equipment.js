const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  available: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for checking if equipment is available
equipmentSchema.virtual('isAvailable').get(function() {
  return this.available > 0;
});

// Method to update availability
equipmentSchema.methods.updateAvailability = async function(quantity) {
  if (this.available + quantity < 0) {
    throw new Error('Not enough equipment available');
  }
  this.available += quantity;
  return this.save();
};

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment; 