import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/Report.scss';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for back button functionality

Chart.register(ChartDataLabels);

const ReportPage2 = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [ratingsData, setRatingsData] = useState({
    breakfast: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    lunch: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
    dinner: { Excellent: 0, Good: 0, Average: 0, Bad: 0, VeryBad: 0 },
  });

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchRatingsData = async () => {
      try {
        const response = await axios.get('http://10.245.27.59:8001/report_duration', {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          },
        });
        setRatingsData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchRatingsData();
  }, [startDate, endDate]);

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
        font: { weight: 'bold' },
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

    const dataToExport = [
      {
        DateRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        Rating: 'Excellent',
        Breakfast: ratingsData.breakfast.Excellent,
        Lunch: ratingsData.lunch.Excellent,
        Dinner: ratingsData.dinner.Excellent,
      },
      {
        DateRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        Rating: 'Good',
        Breakfast: ratingsData.breakfast.Good,
        Lunch: ratingsData.lunch.Good,
        Dinner: ratingsData.dinner.Good,
      },
      {
        DateRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        Rating: 'Average',
        Breakfast: ratingsData.breakfast.Average,
        Lunch: ratingsData.lunch.Average,
        Dinner: ratingsData.dinner.Average,
      },
      {
        DateRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        Rating: 'Bad',
        Breakfast: ratingsData.breakfast.Bad,
        Lunch: ratingsData.lunch.Bad,
        Dinner: ratingsData.dinner.Bad,
      },
      {
        DateRange: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        Rating: 'VeryBad',
        Breakfast: ratingsData.breakfast.VeryBad,
        Lunch: ratingsData.lunch.VeryBad,
        Dinner: ratingsData.dinner.VeryBad,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meal Feedback Report');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Meal_Feedback_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="report-page">
      <h1>Meal Feedback Report</h1>

      <div className="selectors-row">
        <div className="date-picker">
          <label htmlFor="start-date-picker">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MMMM d, yyyy"
          />
          <label htmlFor="end-date-picker">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="MMMM d, yyyy"
          />
        </div>

        <div className="meal-selector">
          <label htmlFor="meal-select">Select Meal:</label>
          <select id="meal-select" value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        <button className="export-button" onClick={exportToExcel}>Export to Excel</button>
      </div>

      <div className="chart-box">
        <div className="bar-chart">
          <h2>{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} Ratings</h2>
          <Bar data={createChartData(selectedMeal)} options={chartOptions} />
        </div>

        <div className="pie-charts">
          <div className="pie-chart">
            <h3>Breakfast</h3>
            <Pie data={createPieChartData('breakfast')} />
          </div>
          <div className="pie-chart">
            <h3>Lunch</h3>
            <Pie data={createPieChartData('lunch')} />
          </div>
          <div className="pie-chart">
            <h3>Dinner</h3>
            <Pie data={createPieChartData('dinner')} />
          </div>
        </div>
      </div>

      {/* Back button */}
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default ReportPage2;
