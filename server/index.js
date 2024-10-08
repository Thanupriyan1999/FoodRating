const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Form = require("./modals/Form.modal"); // Assuming you have a Mongoose model for Form
const Masterdata = require("./modals/Masterdata.modal"); // Import Masterdata model
const app = express();

app.use(cors({
  origin: '*', // Allows all origins (can restrict to specific IP)
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Endpoint to handle form submission with validation for one rating per employee per meal per day
app.post("/form", async (req, res) => {
  try {
    const { employeeID, rating, mealType, date } = req.body;

    // Validate if the employee exists in the Masterdata collection
    const employeeExists = await Masterdata.findOne({ employeeID });
    if (!employeeExists) {
      return res.status(400).json({ message: "Invalid Employee ID" });
    }

    // Format the date to ensure it's consistent
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0); // Set to start of the day

    // Get the start and end of the day
    const startOfDay = new Date(formattedDate);
    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day

    // Check if the employee has already rated for the specific meal type on the given date
    const existingRating = await Form.findOne({
      employeeID,
      mealType,
      date: {
        $gte: startOfDay,  // Start of the day
        $lt: endOfDay,  // End of the day
      },
    });

    if (existingRating) {
      // If a rating exists for this employee, meal, and date, prevent saving
      return res.status(400).json({ message: "You have already rated for this meal today." });
    }

    // If no existing rating, save the new rating
    const newFormEntry = new Form({
      employeeID,
      rating,
      mealType,
      date: new Date(date), // Save the original date
    });

    await newFormEntry.save();
    res.status(201).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});


// Endpoint to handle report generation
app.get("/report", async (req, res) => {
  try {
    const { date } = req.query;
    

    // Convert the input date to a format that matches the start of the date string in the database
    const inputDate = new Date(date).toDateString(); // e.g., "Thu Aug 29 2024"


    console.log(inputDate);
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

    console.log(ratings)

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


// Endpoint to handle report generation for a date range
app.get("/report_duration", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Convert startDate and endDate to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log("Start date:", start);
    console.log("End date:", end);

    // Fetch all documents and then filter by date range in JavaScript
    const ratings = await Form.find({});

    // Filter the ratings between the given date range
    const filteredRatings = ratings.filter(rating => {
      const ratingDate = new Date(rating.date);
      return ratingDate >= start && ratingDate <= end;
    });

    // Initialize result structure for all meal types with zero counts
    const result = {
      breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
      lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
      dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    };

    // Iterate over filtered ratings and update counts
    filteredRatings.forEach(rating => {
      const mealType = rating.mealType.toLowerCase(); // e.g., 'breakfast', 'lunch', 'dinner'

      // Ensure the mealType exists in the result object
      if (result[mealType]) {
        switch (rating.rating) {
          case 'Excellent':
            result[mealType].Excellent += 1;
            break;
          case 'Good':
            result[mealType].Good += 1;
            break;
          case 'Average':
            result[mealType].Average += 1;
            break;
          case 'Bad':
            result[mealType].Bad += 1;
            break;
          case 'Very Bad':
            result[mealType].VeryBad += 1;
            break;
          default:
            break;
        }
      }
    });

    console.log("Result:", result);

    res.json(result);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});


// Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App running on port ${PORT}`);
});
