import React, { useState, useEffect } from 'react';
import "../styles/Login.scss";
import Axios from "axios";


const Form = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [mealType, setMealType] = useState("");
  const currentDate = new Date().toLocaleDateString('en-CA'); // Updated to save in 'yyyy-MM-dd' format

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 11) {
      setMealType("Breakfast");
    } else if (currentHour >= 11 && currentHour < 19) {
      setMealType("Lunch");
    } else if (currentHour >= 19 && currentHour < 23) {
      setMealType("Dinner");
    }
  }, []);

  const handleNumberClick = (number) => {
    if (employeeID.length < 6) {
      setEmployeeID(employeeID + number);
    }
  };

  const handleBackspace = () => {
    setEmployeeID(employeeID.slice(0, -1));
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (employeeID.length === 6 && selectedRating !== null) {
      console.log(`Employee ID: ${employeeID}, Rating: ${selectedRating}, Date: ${currentDate}, Meal Type: ${mealType}`);
  
      saveToDatabase({
        employeeID,
        rating: selectedRating,
        date: currentDate,
        mealType,
      });
    } else {
      alert("Please enter a valid Employee ID and select a rating.");
    }
  };
  
  const saveToDatabase = (data) => {
    Axios.post('http://localhost:8001/form', data)  // Corrected URL
      .then((res) => {
        console.log('Success:', res);
        alert('Data saved successfully!');  // Show success message
  
        // Clear form fields for the next employee
        setEmployeeID('');
        setSelectedRating(null);
  
        // Optionally reload the page
        // window.location.reload();
      })
      .catch(err => {
        console.log('Error:', err);
        alert('Failed to save data, please try again.');  // Show error message
      });
  };
  

  return (
    <div className='login'>
      <div className='header'>
        <h1>Omega Line Vavuniya</h1>
        <h3>{mealType}</h3>
        <h2>{currentDate}</h2>
      </div>
      <div className='content'>
        <div className='rating-buttons'>
        <button
  className={`rating-button excellent ${selectedRating === 'Excellent' ? 'selected' : ''}`}
  onClick={() => handleRatingClick('Excellent')}
>
  Excellent
  <img src="../src/assets/excellent.png" alt="Excellent Emoji" className="emoji-icon" />

</button>



          <button
            className={`rating-button good ${selectedRating === 'Good' ? 'selected' : ''}`}
            onClick={() => handleRatingClick('Good')}
          >
            Good
          </button>
          <button
            className={`rating-button average ${selectedRating === 'Average' ? 'selected' : ''}`}
            onClick={() => handleRatingClick('Average')}
          >
            Average
          </button>
          <button
            className={`rating-button bad ${selectedRating === 'Bad' ? 'selected' : ''}`}
            onClick={() => handleRatingClick('Bad')}
          >
            Bad
          </button>
          <button
            className={`rating-button very-bad ${selectedRating === 'Very Bad' ? 'selected' : ''}`}
            onClick={() => handleRatingClick('Very Bad')}
          >
            Very Bad
          </button>
        </div>
        <div className='keypad'>
          <div className='keypad-display'>{employeeID}</div>
          <div className='keypad-buttons'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button key={number} onClick={() => handleNumberClick(number)}>
                {number}
              </button>
            ))}
            <button className='delete' onClick={handleBackspace}>←</button>
            <button className='enter' onClick={handleSubmit}>Enter</button>
          </div>
        </div>
      </div>
      <a href="/Register">REPORT</a>
    </div>
  );
};

export default Form;
