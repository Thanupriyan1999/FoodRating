const mongoose = require('mongoose');

// Define the schema for Masterdata
const masterdataSchema = new mongoose.Schema({
  employeeID: {  // Renamed to match the form input
    type: Number,
    required: true,
    unique: true,
  },
  // Add any other fields you need
});

// Create the Masterdata model
const Masterdata = mongoose.model('Masterdata', masterdataSchema);

module.exports = Masterdata;
