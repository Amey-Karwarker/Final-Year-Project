from flask import Flask, request, jsonify, render_template
import os
import fitz  # PyMuPDF
import requests
from flask_cors import CORS
import pytesseract
from PIL import Image
import numpy as np
import pickle
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# Initialize Flask
app = Flask(__name__, template_folder="templates")
CORS(app)

# Upload folder setup
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variable to store extracted text for chat context
extracted_text_memory = ""

# Load traditional ML models
models = {}
for disease in ["heart", "diabetes", "liver", "kidney"]:
    model_path = f"models/{disease}.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as model_file:
            model_data = pickle.load(model_file)
            models[disease] = {
                "model": model_data["model"],
                "feature_names": model_data["feature_names"],
                "scaler": model_data.get("scaler", None)
            }
    else:
        raise FileNotFoundError(f"{model_path} not found")

# Load pneumonia CNN model
pneumonia_model = load_model("models/pneumonia.h5")

def preprocess_image(image_path):
    img = load_img(image_path, target_size=(150, 150))
    img_array = img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

# -------------------------- ROUTES --------------------------

# Serve SPA or index.html
@app.route("/")
def home():
    return render_template('index.html')

@app.route("/prediction")
def prediction():
    return render_template("prediction.html")

@app.route("/chatbot")
def chatbot():
    return render_template("chatbot.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

# Disease Prediction (heart, kidney, liver, diabetes)
@app.route("/predict", methods=["POST"])
def predict():
    try:
        input_data = request.json
        disease = input_data.pop("disease")

        if disease not in models:
            return jsonify({"error": "Invalid disease"}), 400

        model_info = models[disease]
        model = model_info["model"]
        feature_names = model_info["feature_names"]

        values = [float(input_data.get(f, 0)) for f in feature_names]
        df = pd.DataFrame([values], columns=feature_names)

        prediction = model.predict(df)[0]
        result = "Disease Present" if prediction == 1 else "No Disease"

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Pneumonia Prediction
@app.route("/predict_pneumonia", methods=["POST"])
def predict_pneumonia():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    image_path = os.path.join(app.config["UPLOAD_FOLDER"], image.filename)
    image.save(image_path)

    img_array = preprocess_image(image_path)
    prediction = pneumonia_model.predict(img_array)[0][0]

    result = "Pneumonia Detected" if prediction > 0.5 else "Normal Lungs"
    return jsonify({"result": result})

# Upload report and extract + chat
@app.route('/extract-and-chat', methods=['POST'])
def extract_and_chat():
    global extracted_text_memory

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = file.filename.lower()

    extracted_text = ""
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        image = Image.open(file.stream)
        extracted_text = pytesseract.image_to_string(image)

    elif filename.endswith('.pdf'):
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            extracted_text += page.get_text()
        doc.close()
    else:
        return jsonify({'error': 'Unsupported file type'}), 400

    extracted_text_memory = extracted_text  # Store for future chats

    prompt = f"This is a medical report: \n\n{extracted_text}\n\nExplain what conditions or diseases might be indicated and what the patient should be aware of."
    ollama_response = requests.post('http://localhost:11434/api/generate', json={
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    })

    result = ollama_response.json()
    return jsonify({
        'extracted_text': extracted_text,
        'ai_explanation': result.get('response', 'No response from Ollama')
    })

@app.route('/chat', methods=['POST'])
def chat():
    global extracted_text_memory
    user_question = request.json.get('question', '')

    if not user_question:
        return jsonify({'error': 'No question provided'}), 400

    prompt = f"Refer to this medical report:\n\n{extracted_text_memory}\n\nUser question: {user_question}\n\nAnswer in simple terms:"
    ollama_response = requests.post('http://localhost:11434/api/generate', json={
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    })

    result = ollama_response.json()
    return jsonify({
        'response': result.get('response', 'No response from Ollama')
    })

# -------------------------- MAIN --------------------------
if __name__ == "__main__":
    app.run(debug=True)
