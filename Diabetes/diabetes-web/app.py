from flask import Flask, request, jsonify, render_template
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load data and train model
data = pd.read_csv("diabetes.csv")

X = data.iloc[:, :-1]
y = data['Outcome']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=10)

model = RandomForestClassifier(n_estimators=20)
model.fit(X_train, y_train)

# Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.json
        values = [float(input_data[key]) for key in input_data.keys()]
        input_array = np.array(values).reshape(1, -1)
        prediction = model.predict(input_array)[0]
        result = "Diabetes Detected" if prediction == 1 else "No Diabetes"
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
