import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [animationClass, setAnimationClass] = useState('');
  const [formData, setFormData] = useState({
    sex: '',
    age: '',
    education: '',
    cigarettes_per_day: '',
    blood_pressure_medications: '',
    prevalent_stroke: '',
    prevalent_hypertension: '',
    diabetes: '',
    cholesterol: '',
    bmi: '',
    heart_rate: '',
    glucose: '',
    pulse_pressure: '',
  });
  const [prediction, setPrediction] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.sex && formData.age && formData.education;
      case 2:
        return formData.cigarettes_per_day;
      case 3:
        return (
          formData.blood_pressure_medications &&
          formData.prevalent_stroke &&
          formData.prevalent_hypertension &&
          formData.diabetes
        );
      case 4:
        return (
          formData.cholesterol &&
          formData.bmi &&
          formData.heart_rate &&
          formData.glucose &&
          formData.pulse_pressure
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepComplete()) {
      setAnimationClass('fade-out');
      setTimeout(() => {
        setStep(step + 1);
        setAnimationClass('fade-in');
      }, 500);
    }
  };

  const handlePrediction = () => {
    const dataToSend = {
      sex: formData.sex === 'Male' ? 1 : 0,
      age: parseInt(formData.age),
      education: parseInt(formData.education),
      cigarettes_per_day: parseInt(formData.cigarettes_per_day),
      blood_pressure_medications: formData.blood_pressure_medications === 'Yes' ? 1 : 0,
      prevalent_stroke: formData.prevalent_stroke === 'Yes' ? 1 : 0,
      prevalent_hypertension: formData.prevalent_hypertension === 'Yes' ? 1 : 0,
      diabetes: formData.diabetes === 'Yes' ? 1 : 0,
      cholesterol: parseInt(formData.cholesterol),
      bmi: parseFloat(formData.bmi),
      heart_rate: parseInt(formData.heart_rate),
      glucose: parseInt(formData.glucose),
      pulse_pressure: parseInt(formData.pulse_pressure),
    };

    // Step 1: Get prediction from Flask API
    axios.post('http://localhost:5001/predict', dataToSend) // Ensure the API endpoint is correct
      .then((response) => {
        // Ensure you correctly access prediction from response
        const predictionValue = response.data.prediction;
        setPrediction(predictionValue);  // Store prediction value
        alert('Prediction: ' + (predictionValue === 1 ? 'At Risk' : 'No Risk'));

        // Step 2: Save prediction and form data to MongoDB using Node API
        saveToDatabase(dataToSend, predictionValue);
      })
      .catch((error) => {
        console.error('Error making prediction:', error);
        alert('There was an error making the prediction. Please try again.');
      });
  };

  const saveToDatabase = (data, prediction) => {
    axios.post('http://localhost:5000/save', {
      ...data,
      prediction,
    })
    .then((response) => {
      alert('Data saved successfully: ' + response.data.message);
    })
    .catch((error) => {
      console.error('Error saving data:', error);
    });
  };

  const handleViewAnalysis = () => {
    // Logic to view analysis of models can be added here
    alert("Viewing analysis of models"); // Placeholder for your logic
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 500);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-header">Cardiovascular Risk Prediction (Classification)</div>
        <form id="cardioForm">
          {/* Step 1: Demographic Data */}
          <div className={`form-section ${animationClass} ${step >= 1 ? 'visible' : ''}`}>
            <div className="form-section-header">Demographic Data</div>
            <div className="mb-3">
              <label htmlFor="sex" className="form-label">Sex</label>
              <select
                className="form-select"
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="education" className="form-label">Education (1 lower, 4 higher)</label>
              <input
                type="number"
                className="form-control"
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                min="1"
                max="4"
                required
              />
            </div>
            {step === 1 && (
              <button type="button" className="btn btn-primary mt-3 animated-button" onClick={nextStep}>
                Continue to Behavioral Data
              </button>
            )}
          </div>

          {/* Step 2: Behavioral Data */}
          {step >= 2 && (
            <div className={`form-section ${animationClass} ${step >= 2 ? 'visible' : ''}`}>
              <div className="form-section-header">Behavioral Data</div>
              <div className="mb-3">
                <label htmlFor="cigarettes_per_day" className="form-label">Cigarettes per Day</label>
                <input
                  type="number"
                  className="form-control"
                  id="cigarettes_per_day"
                  name="cigarettes_per_day"
                  value={formData.cigarettes_per_day}
                  onChange={handleChange}
                  required
                />
              </div>
              {step === 2 && (
                <button type="button" className="btn btn-primary mt-3 animated-button" onClick={nextStep}>
                  Continue to Medical (History)
                </button>
              )}
            </div>
          )}

          {/* Step 3: Medical (History) */}
          {step >= 3 && (
            <div className={`form-section ${animationClass} ${step >= 3 ? 'visible' : ''}`}>
              <div className="form-section-header">Medical (History)</div>
              <div className="mb-3">
                <label htmlFor="blood_pressure_medications" className="form-label">Blood Pressure Medications?</label>
                <select
                  className="form-select"
                  id="blood_pressure_medications"
                  name="blood_pressure_medications"
                  value={formData.blood_pressure_medications}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="prevalent_stroke" className="form-label">Prevalent Stroke?</label>
                <select
                  className="form-select"
                  id="prevalent_stroke"
                  name="prevalent_stroke"
                  value={formData.prevalent_stroke}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="prevalent_hypertension" className="form-label">Prevalent Hypertension?</label>
                <select
                  className="form-select"
                  id="prevalent_hypertension"
                  name="prevalent_hypertension"
                  value={formData.prevalent_hypertension}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="diabetes" className="form-label">Diabetes?</label>
                <select
                  className="form-select"
                  id="diabetes"
                  name="diabetes"
                  value={formData.diabetes}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {step === 3 && (
                <button type="button" className="btn btn-primary mt-3 animated-button" onClick={nextStep}>
                  Continue to Medical (Current)
                </button>
              )}
            </div>
          )}

          {/* Step 4: Medical (Current) */}
          {step >= 4 && (
            <div className={`form-section ${animationClass} ${step >= 4 ? 'visible' : ''}`}>
              <div className="form-section-header">Medical (Current)</div>
              <div className="mb-3">
                <label htmlFor="cholesterol" className="form-label">Cholesterol Level</label>
                <input
                  type="number"
                  className="form-control"
                  id="cholesterol"
                  name="cholesterol"
                  value={formData.cholesterol}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="bmi" className="form-label">BMI</label>
                <input
                  type="number"
                  className="form-control"
                  id="bmi"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  step="0.1"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="heart_rate" className="form-label">Heart Rate</label>
                <input
                  type="number"
                  className="form-control"
                  id="heart_rate"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="glucose" className="form-label">Glucose Level</label>
                <input
                  type="number"
                  className="form-control"
                  id="glucose"
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="pulse_pressure" className="form-label">Pulse Pressure</label>
                <input
                  type="number"
                  className="form-control"
                  id="pulse_pressure"
                  name="pulse_pressure"
                  value={formData.pulse_pressure}
                  onChange={handleChange}
                  required
                />
              </div>
              {step === 4 && (
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-primary mt-3 animated-button" onClick={handlePrediction}>
                    Submit
                  </button>
                  <button type="button" className="btn btn-secondary mt-3 animated-button" onClick={handleViewAnalysis}>
                    View Analysis of Models
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Display Prediction Result */}
          {prediction !== '' && (
            <div className="prediction-result">
              <h3>Prediction: {prediction === 1 ? 'At Risk' : 'No Risk'}</h3>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;
