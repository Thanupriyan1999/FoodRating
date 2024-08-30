import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/Report.scss';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
Chart.register(ChartDataLabels);

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [ratingsData, setRatingsData] = useState({
    breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
  });

  useEffect(() => {
    const fetchRatingsData = async () => {
      try {
        const response = await axios.get('http://localhost:8001/report', {
          params: { date: selectedDate.toISOString().split('T')[0] },
        });
        setRatingsData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchRatingsData();
  }, [selectedDate]);

  const chartOptions = {
    responsive: true,
    scales: {
      x: { beginAtZero: true },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} feedback(s)`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'start',
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value, context) => {
          return value;
        },
      },
    },
  };

  const createChartData = (mealType) => ({
    labels: ['Excellent', 'Good', 'Average', 'Bad', 'Very Bad'],
    datasets: [
      {
        label: `${mealType} Ratings`,
        data: Object.values(ratingsData[mealType.toLowerCase()]),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#F44336'],
        borderColor: '#fff',
        borderWidth: 2,
        hoverBackgroundColor: ['#45A049', '#1976D2', '#FFB300', '#F4511E', '#E53935'],
      },
    ],
  });

  return (
    <div className="report-page">
      <h1>Meal Feedback Report</h1>
      <div className="date-picker">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MMMM d, yyyy"
        />
      </div>
      <div className="meal-selector">
        <label htmlFor="meal-select">Select Meal:</label>
        <select
          id="meal-select"
          value={selectedMeal}
          onChange={(e) => setSelectedMeal(e.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>
      <div className="chart-box">
        <h2>{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} Ratings</h2>
        <Bar data={createChartData(selectedMeal)} options={chartOptions} />
      </div>
    </div>
  );
};

export default ReportPage;
