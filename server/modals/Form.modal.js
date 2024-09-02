const { Schema } = require("mongoose");
const mongoose = require("../Config/mongodb");

const formSchema = new Schema({
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

module.exports = mongoose.model("Form", formSchema);
