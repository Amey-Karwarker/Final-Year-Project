const features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
const formInputs = document.getElementById('formInputs');

// Dynamically create input fields for each feature
features.forEach(feature => {
    formInputs.innerHTML += `
        <div class="form-group">
            <label for="${feature}">${feature}</label>
            <input type="number" id="${feature}" name="${feature}" required>
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
    const resultDiv = document.getElementById('result');

    if (result.error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = `Error: ${result.error}`;
    } else {
        resultDiv.className = 'result success';
        resultDiv.textContent = result.result;
    }
});
