import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/Report.scss';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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
        formatter: (value) => value,
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

  const createPieChartData = (mealType) => ({
    labels: ['Excellent', 'Good', 'Average', 'Bad', 'Very Bad'],
    datasets: [
      {
        data: Object.values(ratingsData[mealType.toLowerCase()]),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#F44336'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  });

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const dataToExport = [];
    
    Object.keys(ratingsData).forEach((meal) => {
      Object.keys(ratingsData[meal]).forEach((rating) => {
        dataToExport.push({
          Date: selectedDate.toISOString().split('T')[0],
          Meal: meal.charAt(0).toUpperCase() + meal.slice(1),
          Rating: rating,
          Count: ratingsData[meal][rating],
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meal Feedback Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Meal_Feedback_Report_${selectedDate.toISOString().split('T')[0]}.xlsx`);
  };

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
      <button className="export-button" onClick={exportToExcel}>Export to Excel</button>
      <div className="chart-box">
        <h2>{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} Ratings</h2>
        <div className="chart-container">
          <div className="bar-chart">
            <Bar data={createChartData(selectedMeal)} options={chartOptions} />
          </div>
          <div className="pie-chart">
            <Pie data={createPieChartData(selectedMeal)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
