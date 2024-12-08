from flask import Flask, request, jsonify, render_template
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load data and train model
data = pd.read_csv("heart (1).csv")

X = data.drop(['target'], axis=1)
y = data['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

classifier = RandomForestClassifier(n_jobs=-1, n_estimators=400, bootstrap=False, 
                                     criterion='gini', max_depth=5, max_features=3, 
                                     min_samples_leaf=7)
classifier.fit(X_train, y_train)

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
        prediction = classifier.predict(input_array)[0]
        result = "Disease Present" if prediction == 1 else "No Disease"
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
