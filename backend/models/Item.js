const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  name: String,
  type: String,
  quantity: Number,
  available: Boolean,
});
module.exports = mongoose.model('Item', ItemSchema);