import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import joblib
import random  # Import random module

app = Flask(__name__)
CORS(app)

# Load the pre-trained models and scaler
neural_model = pickle.load(open('neural2.pkl', 'rb'))
rf_model = joblib.load('random_forest_model.pkl')
dt_model = joblib.load('decision_tree_model.pkl')
scaler = pickle.load(open('scaler.pkl', 'rb'))

@app.route('/')
def home():
    return "Cardiovascular Risk Prediction API"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Remove model_type from data if it exists (as it's not a feature)
        data.pop('model_type', None)

        # Convert the input data to a DataFrame
        input_data = pd.DataFrame([data])

        # Ensure the input data matches the expected features
        required_columns = [
            'sex', 'age', 'education', 'cigarettes_per_day', 
            'blood_pressure_medications', 'prevalent_stroke', 
            'prevalent_hypertension', 'diabetes', 'cholesterol', 
            'bmi', 'heart_rate', 'glucose', 'pulse_pressure'
        ]
        input_data = input_data.reindex(columns=required_columns, fill_value=0)

        # Scale the input data
        input_data_scaled = scaler.transform(input_data)

        # Predict using all models
        neural_prediction = neural_model.predict(input_data_scaled)
        rf_prediction = rf_model.predict(input_data_scaled)
        dt_prediction = dt_model.predict(input_data_scaled)

        # Convert predictions to readable results
        neural_result = 'At Risk' if int(neural_prediction[0]) == 1 else 'No Risk'
        rf_result = 'At Risk' if int(rf_prediction[0]) == 1 else 'No Risk'
        dt_result = 'At Risk' if int(dt_prediction[0]) == 1 else 'No Risk'

        # Return all model predictions in the response
        return jsonify({
            'neural_network_prediction': neural_result,
            'random_forest_prediction': rf_result,
            'decision_tree_prediction': dt_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)})



if __name__ == '__main__':
    app.run(debug=True, port=5001)
