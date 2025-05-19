document.addEventListener("DOMContentLoaded", function () {
    function navigateTo(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }

    document.querySelector(".cta-button").addEventListener("click", function () {
        window.location.href = "/chatbot";
    });

    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", function () {
            let buttonText = this.textContent.trim();

            if (buttonText === "Start Prediction") {
                window.location.href = "/prediction";
            } else if (buttonText === "Start Chat") {
                window.location.href = "/chatbot";
            } else if (buttonText === "Contact Now") {
                navigateTo("#contact");
            }
        });
    });

    document.querySelectorAll("nav ul li a").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (targetId.startsWith("#")) {
                navigateTo(targetId);
            } else {
                window.location.href = targetId;
            }
        });
    });
});

// Prediction Page Script
if (document.getElementById("prediction-form")) {
    document.addEventListener("DOMContentLoaded", function () {
        const diseaseSelect = document.getElementById("disease");
        const inputFieldsDiv = document.getElementById("input-fields");
        const fileUploadDiv = document.getElementById("file-upload");
        const fileInput = document.getElementById("image-input");
        const form = document.getElementById("prediction-form");
        const resultDiv = document.getElementById("result");

        const diseaseInputs = {
            heart: [
                { name: "age", label: "Age", type: "number" },
                { name: "sex", label: "Sex (0 = Female, 1 = Male)", type: "number" },
                { name: "cp", label: "Chest Pain Type (0-3)", type: "number" },
                { name: "trestbps", label: "Resting Blood Pressure", type: "number" },
                { name: "chol", label: "Cholesterol Level", type: "number" },
                { name: "fbs", label: "Fasting Blood Sugar > 120 mg/dl (0 or 1)", type: "number" },
                { name: "restecg", label: "Resting ECG Results (0-2)", type: "number" },
                { name: "thalach", label: "Maximum Heart Rate Achieved", type: "number" },
                { name: "exang", label: "Exercise Induced Angina (0 or 1)", type: "number" },
                { name: "oldpeak", label: "ST Depression", type: "number", step: "any" },
                { name: "slope", label: "Slope of Peak Exercise ST (0-2)", type: "number" },
                { name: "ca", label: "Number of Major Vessels (0-3)", type: "number" },
                { name: "thal", label: "Thalassemia (1-3)", type: "number" }
            ],
            diabetes: [
                { name: "Pregnancies", label: "Pregnancies", type: "number" },
                { name: "Glucose", label: "Glucose Level (60-200 mg/dL)", type: "number" },
                { name: "BloodPressure", label: "Blood Pressure (40-122 mm Hg)", type: "number" },
                { name: "SkinThickness", label: "Skin Thickness (7-100 mm)", type: "number" },
                { name: "Insulin", label: "Insulin Level (15-276 μU/mL)", type: "number" },
                { name: "BMI", label: "BMI (18.5 to 50+)", type: "number", step: "any" },
                { name: "DiabetesPedigreeFunction", label: "Diabetes Pedigree Function (0.6 to 2.2)", type: "number", step: "any" },
                { name: "Age", label: "Age", type: "number" }
            ],
            liver: [
                { name: "Age", label: "Age", type: "number" },
                { name: "Gender", label: "Gender (0 = Female, 1 = Male)", type: "number" },
                { name: "Total_Bilirubin", label: "Total Bilirubin", type: "number", step: "any" },
                { name: "Direct_Bilirubin", label: "Direct Bilirubin", type: "number", step: "any" },
                { name: "Alkaline_Phosphotase", label: "Alkaline Phosphotase", type: "number" },
                { name: "Alamine_Aminotransferase", label: "Alamine Aminotransferase", type: "number" },
                { name: "Aspartate_Aminotransferase", label: "Aspartate Aminotransferase", type: "number" },
                { name: "Total_Protiens", label: "Total Proteins", type: "number", step: "any" },
                { name: "Albumin", label: "Albumin", type: "number", step: "any" },
                { name: "Albumin_and_Globulin_Ratio", label: "Albumin & Globulin Ratio", type: "number", step: "any" }
            ],
            kidney: [
                { name: "age", label: "Age", type: "number" },
                { name: "bp", label: "Blood Pressure", type: "number" },
                { name: "sg", label: "Specific Gravity", type: "number", step: "any" },
                { name: "al", label: "Albumin", type: "number" },
                { name: "sc", label: "Serum Creatinine", type: "number", step: "any" },
                { name: "hemo", label: "Hemoglobin", type: "number", step: "any" },
                { name: "htn", label: "Hypertension (0 = No, 1 = Yes)", type: "number" },
                { name: "dm", label: "Diabetes Mellitus (0 = No, 1 = Yes)", type: "number" },
                { name: "appet", label: "Appetite (0 = Poor, 1 = Good)", type: "number" },
                { name: "ane", label: "Anemia (0 = No, 1 = Yes)", type: "number" }
            ]
        };

        function updateFormFields() {
            inputFieldsDiv.innerHTML = "";
            fileUploadDiv.style.display = "none";

            const selectedDisease = diseaseSelect.value;
            if (selectedDisease === "pneumonia") {
                fileUploadDiv.style.display = "block"; // Show file upload
            } else if (diseaseInputs[selectedDisease]) {
                diseaseInputs[selectedDisease].forEach(field => {
                    const label = document.createElement("label");
                    label.textContent = field.label;
                    const input = document.createElement("input");
                    input.type = field.type;
                    input.name = field.name;
                    input.required = true;
                    input.step = "any";

                    inputFieldsDiv.appendChild(label);
                    inputFieldsDiv.appendChild(input);
                });
            }
        }

        diseaseSelect.addEventListener("change", updateFormFields);
        updateFormFields();

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const selectedDisease = diseaseSelect.value;

            if (selectedDisease === "pneumonia") {
                if (!fileInput.files.length) {
                    resultDiv.innerHTML = `<p class="error">Please upload an image.</p>`;
                    return;
                }

                const formData = new FormData();
                formData.append("image", fileInput.files[0]);
                formData.append("disease", "pneumonia");

                try {
                    const response = await fetch("/predict_pneumonia", {
                        method: "POST",
                        body: formData
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = `<p>Prediction: <strong>${result.result}</strong></p>`;
                } catch (error) {
                    resultDiv.innerHTML = `<p class="error">Error predicting pneumonia.</p>`;
                }
            } else {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                data["disease"] = selectedDisease;

                Object.keys(data).forEach(key => {
                    if (!isNaN(data[key])) {
                        data[key] = parseFloat(data[key]);
                    }
                });

                try {
                    const response = await fetch("/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = result.error ? `<p class="error">Error: ${result.error}</p>` : `<p>Prediction: <strong>${result.result}</strong></p>`;
                } catch (error) {
                    resultDiv.innerHTML = `<p>Error predicting disease.</p>`;
                }
            }
        });
    });
}