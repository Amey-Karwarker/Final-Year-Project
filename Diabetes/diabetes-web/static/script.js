// Define the features and specify their types (integer or float)
const features = [
    { name: 'Pregnancies', type: 'number' },
    { name: 'Glucose', type: 'number' },
    { name: 'BloodPressure', type: 'number' },
    { name: 'SkinThickness', type: 'number' },
    { name: 'Insulin', type: 'number' },
    { name: 'BMI', type: 'float' },
    { name: 'DiabetesPedigreeFunction', type: 'float' },
    { name: 'Age', type: 'number' }
];

// Get the form inputs container
const formInputs = document.getElementById('formInputs');

// Dynamically create input fields for each feature
features.forEach(feature => {
    formInputs.innerHTML += `
        <div class="form-group">
            <label for="${feature.name}">${feature.name}</label>
            <input 
                type="number" 
                id="${feature.name}" 
                name="${feature.name}" 
                ${feature.type === 'float' ? 'step="any"' : ''} 
                required
            >
        </div>
    `;
});

// Handle form submission
const predictionForm = document.getElementById('predictionForm');
const resultDisplay = document.getElementById('result');

predictionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect user input values
    const formData = {};
    features.forEach(feature => {
        const value = document.getElementById(feature.name).value;
        formData[feature.name] = parseFloat(value); // Convert inputs to float for processing
    });

    try {
        // Send a POST request to the backend with user inputs
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch prediction');
        }

        // Display the prediction result
        const data = await response.json();
        resultDisplay.innerHTML = `
            <h3>Prediction Result</h3>
            <p>${data.prediction === 1 ? 'Diabetes Detected' : 'No Diabetes Detected'}</p>
        `;
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.innerHTML = `
            <h3>Error</h3>
            <p>There was an issue processing your request. Please try again.</p>
        `;
    }
});
