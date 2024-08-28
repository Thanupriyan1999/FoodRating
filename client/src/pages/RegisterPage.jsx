import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Axios from "axios";
import "../styles/Report.scss";

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ratingsData, setRatingsData] = useState({
    breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
  });

  const fetchRatingsData = async (date) => {
    try {
      const response = await Axios.get("http://localhost:8001/report", {
        params: { date: date.toISOString().split("T")[0] },
      });
      setRatingsData(response.data);
    } catch (err) {
      console.log("Failed to fetch data", err.message);
    }
  };
  

  useEffect(() => {
    fetchRatingsData(selectedDate);
  }, [selectedDate]);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const createChartData = (mealType) => ({
    labels: ["Excellent", "Good", "Average", "Bad", "Very Bad"],
    datasets: [
      {
        label: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        data: Object.values(ratingsData[mealType.toLowerCase()]),
        backgroundColor: [
          "green",
          "blue",
          "yellow",
          "orange",
          "red",
        ],
      },
    ],
  });

  return (
    <div className="report">
      <h1>Ratings Report</h1>
      <div className="date-picker">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MMMM d, yyyy"
        />
      </div>
      <div className="chart">
        <h2>Breakfast Ratings</h2>
        <Bar data={createChartData("breakfast")} options={chartOptions} />
      </div>
      <div className="chart">
        <h2>Lunch Ratings</h2>
        <Bar data={createChartData("lunch")} options={chartOptions} />
      </div>
      <div className="chart">
        <h2>Dinner Ratings</h2>
        <Bar data={createChartData("dinner")} options={chartOptions} />
      </div>
    </div>
  );
};

export default ReportPage;
