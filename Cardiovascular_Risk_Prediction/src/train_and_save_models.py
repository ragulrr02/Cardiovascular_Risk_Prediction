import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import joblib

# Load your dataset (Replace with your actual CSV file path)
csv_file_path = 'data_cardiovascular_risk.csv'  # Path to your CSV file
df = pd.read_csv(csv_file_path)

# Example preprocessing: encoding categorical variables and handling missing values
df['sex'] = df['sex'].map({'Male': 1, 'Female': 0})  # Encode sex as 1 for Male, 0 for Female
df['is_smoking'] = df['is_smoking'].replace({'YES': 1, 'NO': 0})
df['BPMeds'] = df['BPMeds'].replace({'YES': 1, 'NO': 0})
df['prevalentStroke'] = df['prevalentStroke'].replace({'YES': 1, 'NO': 0})
df['prevalentHyp'] = df['prevalentHyp'].replace({'YES': 1, 'NO': 0})
df['diabetes'] = df['diabetes'].replace({'YES': 1, 'NO': 0})

# Fill missing values with 0
df.fillna(0, inplace=True)

# Define features (X) and target variable (y)
X = df.drop('TenYearCHD', axis=1)  # Features
y = df['TenYearCHD']  # Target variable

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize scaler and scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train and save the Neural Network model
neural_model = MLPClassifier(hidden_layer_sizes=(100,), max_iter=500, random_state=42)
neural_model.fit(X_train_scaled, y_train)
with open('neural2.pkl', 'wb') as f:
    pickle.dump(neural_model, f)

# Train and save the Random Forest model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_scaled, y_train)
joblib.dump(rf_model, 'random_forest_model.pkl')

# Train and save the Decision Tree model
dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X_train_scaled, y_train)
joblib.dump(dt_model, 'decision_tree_model.pkl')

# Save the scaler
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("Models and scaler saved successfully!")
