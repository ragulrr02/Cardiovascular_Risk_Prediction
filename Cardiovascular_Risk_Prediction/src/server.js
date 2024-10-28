const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cardiovascular', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for user data and prediction
const userSchema = new mongoose.Schema({
  sex: String,
  age: Number,
  education: Number,
  cigarettes_per_day: Number,
  blood_pressure_medications: String,
  prevalent_stroke: String,
  prevalent_hypertension: String,
  diabetes: String,
  cholesterol: Number,
  bmi: Number,
  heart_rate: Number,
  glucose: Number,
  pulse_pressure: Number,
  prediction: String, // Store the prediction result
});

const User = mongoose.model('User', userSchema);

// API to save form data and result to MongoDB
app.post('/save', async (req, res) => {
  try {
    const userData = new User(req.body);

    // Call Python API to get the prediction result
    const predictionResult = await makePrediction(userData);
    userData.prediction = predictionResult;

    // Save the user data and prediction result to MongoDB
    await userData.save();
    res.status(200).json({ message: 'Data saved successfully!', prediction: predictionResult });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data!' });
  }
});

// Function to send data to Python Flask API for prediction
const makePrediction = async (data) => {
  try {
    const response = await axios.post('http://localhost:5001/predict', { // Changed to port 5001 for Flask
      sex: data.sex === 'Male' ? 1 : 0,
      age: data.age,
      education: data.education,
      cigarettes_per_day: data.cigarettes_per_day,
      blood_pressure_medications: data.blood_pressure_medications === 'Yes' ? 1 : 0,
      prevalent_stroke: data.prevalent_stroke === 'Yes' ? 1 : 0,
      prevalent_hypertension: data.prevalent_hypertension === 'Yes' ? 1 : 0,
      diabetes: data.diabetes === 'Yes' ? 1 : 0,
      cholesterol: data.cholesterol,
      bmi: data.bmi,
      heart_rate: data.heart_rate,
      glucose: data.glucose,
      pulse_pressure: data.pulse_pressure,
    });

    return response.data.prediction; // Return the prediction result
  } catch (error) {
    console.error('Error calling prediction API:', error);
    throw error; // Propagate the error to the calling function
  }
};

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
