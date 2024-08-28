const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Form = require('./modals/Form.modal'); // Ensure this path is correct

const app = express();

const url = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(url);
    console.log('Mongodb connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

connectToDatabase();

// Endpoint to handle form submission
app.post('/form', async (req, res) => {
    try {
      const { employeeID, rating, mealType, date } = req.body;
  
      const newFormEntry = new Form({
        employeeID,
        rating,
        mealType,
        date: new Date(date), // Convert string date to Date object
      });
  
      await newFormEntry.save();
      res.status(201).json({ message: 'Data saved successfully' });
    } catch (err) {
      console.error('Error saving data:', err);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });
  

// Endpoint to generate report based on a specific date
app.get('/report', async (req, res) => {
    try {
      const { date } = req.query;
  
      // Convert the date from the query string to a Date object and set the time to 00:00:00
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
  
      // Set the end date to the next day at 00:00:00 to include all ratings from the selected day
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
  
      const ratings = await Form.aggregate([
        {
          $match: {
            date: {
              $gte: startDate, // Match dates greater than or equal to startDate
              $lt: endDate, // Match dates less than endDate
            },
          },
        },
        {
          $group: {
            _id: "$mealType", // Group by meal type (Breakfast, Lunch, Dinner)
            Excellent: { $sum: { $cond: [{ $eq: ["$rating", "Excellent"] }, 1, 0] } },
            Good: { $sum: { $cond: [{ $eq: ["$rating", "Good"] }, 1, 0] } },
            Average: { $sum: { $cond: [{ $eq: ["$rating", "Average"] }, 1, 0] } },
            Bad: { $sum: { $cond: [{ $eq: ["$rating", "Bad"] }, 1, 0] } },
            VeryBad: { $sum: { $cond: [{ $eq: ["$rating", "Very Bad"] }, 1, 0] } },
          },
        },
      ]);
  
      const result = {
        breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
        lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
        dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
      };
  
      ratings.forEach(rating => {
        result[rating._id.toLowerCase()] = {
          Excellent: rating.Excellent,
          Good: rating.Good,
          Average: rating.Average,
          Bad: rating.Bad,
          VeryBad: rating.VeryBad,
        };
      });
  
      res.json(result); // Send the aggregated data back to the client
    } catch (err) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });
  

app.listen(8001, () => {
  console.log('App running on port 8001');
});
