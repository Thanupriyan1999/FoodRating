require("dotenv").config();

const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(`${MONGO_URI}`);
const db = mongoose.connection;

db.on("error", function (err) {
  console.error("MongoDB connection error:", err);
});

db.once("open", function () {
  console.log("MongoDB connected successfully");
});

module.exports = mongoose;
