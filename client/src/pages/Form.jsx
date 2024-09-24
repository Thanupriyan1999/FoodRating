import React, { useState, useEffect } from 'react';
import "../styles/Login.scss";
import Axios from "axios";

const Form = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [mealType, setMealType] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent default form submission and page refresh

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
    Axios.post('http://10.245.27.59:8001/form', data)
      .then((res) => {
        console.log('Success:', res);
        setShowSuccessMessage(true);  // Show success message

        // Hide success message after 1 second without refreshing the page
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Clear form fields for the next employee
          setEmployeeID('');
          setSelectedRating(null);
        }, 1000); // Set time to 1 second (1000 ms)
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          // Handle case where employee has already rated for this meal today
          alert(err.response.data.message || 'You have already rated for this meal today.');
        } else {
          console.log('Error:', err);
          alert('Failed to save data, please try again.');
        }
      });
  };

  return (
    <div className='login'>
      <div className='header'>
        <h1>Omega Line Vavuniya</h1>
        <h3>{mealType}</h3>
        <h2>{currentDate}</h2>
      </div>
      
      {/* Wrapping the content in a form tag */}
      <form onSubmit={handleSubmit}>
        <div className='content'>
          <div className='rating-buttons'>
            <button className={`rating-button excellent ${selectedRating === 'Excellent' ? 'selected' : ''}`} type="button" onClick={() => handleRatingClick('Excellent')}>
              Excellent
              <img src="./assets/excellent.png" alt="Excellent Emoji" className="emoji-icon" />
            </button>
            <button className={`rating-button good ${selectedRating === 'Good' ? 'selected' : ''}`} type="button" onClick={() => handleRatingClick('Good')}>
              Good
              <img src="./assets/good.png" alt="Good Emoji" className="emoji-icon" />
            </button>
            <button className={`rating-button average ${selectedRating === 'Average' ? 'selected' : ''}`} type="button" onClick={() => handleRatingClick('Average')}>
              Average
              <img src="./assets/average.png" alt="Average Emoji" className="emoji-icon" />
            </button>
            <button className={`rating-button bad ${selectedRating === 'Bad' ? 'selected' : ''}`} type="button" onClick={() => handleRatingClick('Bad')}>
              Bad
              <img src="./assets/bad.png" alt="Bad Emoji" className="emoji-icon" />
            </button>
            <button className={`rating-button very-bad ${selectedRating === 'Very Bad' ? 'selected' : ''}`} type="button" onClick={() => handleRatingClick('Very Bad')}>
              Very Bad
              <img src="./assets/very_bad.png" alt="Very Bad Emoji" className="emoji-icon" />
            </button>
          </div>

          <div className='keypad-wrapper'>
            {/* Success message positioned on the left */}
            {showSuccessMessage && (
              <div className='success-message'>
                Data saved successfully!
              </div>
            )}

            <div className='keypad'>
              <div className='keypad-display'>{employeeID}</div>
              <div className='keypad-buttons'>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
                  <button key={number} type="button" onClick={() => handleNumberClick(number)}>{number}</button>
                ))}
                <button className='delete' type="button" onClick={handleBackspace}>←</button>
                <button className='enter' type="submit">Enter</button> {/* Ensure this is type="submit" */}
              </div>
            </div>
          </div>
        </div>
      </form>

      <a href="/Register" className="report-button">REPORT</a>
    </div>
  );
};

export default Form;