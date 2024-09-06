const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Form = require("./modals/Form.modal");

const app = express();

app.use(cors({
  origin: '*', // Allows all origins (can restrict to specific IP)
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Endpoint to handle form submission
app.post("/form", async (req, res) => {
  try {
    const { employeeID, rating, mealType, date } = req.body;

    const newFormEntry = new Form({
      employeeID,
      rating,
      mealType,
      date: new Date(date),
    });

    await newFormEntry.save();
    res.status(201).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

app.get("/report", async (req, res) => {
  try {
    const { date } = req.query;

    // Convert the input date to a format that matches the start of the date string in the database
    const inputDate = new Date(date).toDateString(); // e.g., "Thu Aug 29 2024"

    const ratings = await Form.aggregate([
      {
        $match: {
          $expr: {
            $regexMatch: {
              input: "$date", // Field from the database
              regex: `^${inputDate}`, // Match the beginning of the date string
            },
          },
        },
      },
      {
        $group: {
          _id: "$mealType", // Group by meal type (Breakfast, Lunch, Dinner)
          Excellent: {
            $sum: { $cond: [{ $eq: ["$rating", "Excellent"] }, 1, 0] },
          },
          Good: { $sum: { $cond: [{ $eq: ["$rating", "Good"] }, 1, 0] } },
          Average: { $sum: { $cond: [{ $eq: ["$rating", "Average"] }, 1, 0] } },
          Bad: { $sum: { $cond: [{ $eq: ["$rating", "Bad"] }, 1, 0] } },
          VeryBad: {
            $sum: { $cond: [{ $eq: ["$rating", "Very Bad"] }, 1, 0] },
          },
        },
      },
    ]);

    // Initialize result structure for all meal types with zero counts
    const result = {
      breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
      lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
      dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    };

    // Populate result with actual counts from the aggregation
    ratings.forEach((rating) => {
      const mealType = rating._id.toLowerCase();
      result[mealType] = {
        Excellent: rating.Excellent,
        Good: rating.Good,
        Average: rating.Average,
        Bad: rating.Bad,
        VeryBad: rating.VeryBad,
      };
    });

    // Return the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`App running on port ${PORT}`);
});
