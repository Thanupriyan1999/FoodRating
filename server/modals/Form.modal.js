const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Form', formSchema);
