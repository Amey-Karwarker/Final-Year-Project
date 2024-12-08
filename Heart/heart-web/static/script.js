const features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
const formInputs = document.getElementById('formInputs');

// Dynamically create input fields for each feature
features.forEach(feature => {
    formInputs.innerHTML += `
        <div>
            <label for="${feature}">${feature}</label>
            <input type="text" id="${feature}" name="${feature}" required>
        </div>
    `;
});

// Handle form submission
const form = document.getElementById('predictionForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect user inputs
    const inputs = {};
    features.forEach(feature => {
        inputs[feature] = document.getElementById(feature).value;
    });

    // Send data to backend for prediction
    const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
    });

    // Display result
    const result = await response.json();
    document.getElementById('result').textContent = result.result || `Error: ${result.error}`;
});
