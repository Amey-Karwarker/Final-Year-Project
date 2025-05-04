from flask import Flask, request, jsonify, render_template
import os
import openai
import pdfplumber
import pytesseract
from PIL import Image
import numpy as np
import pickle  # To load trained model
import pandas as pd
# from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__, template_folder="templates")
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# OpenAI API Key (Replace with your actual key)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Load Trained Models
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
        raise FileNotFoundError(f"Model file {model_path} not found. Train & save the model first.")


def extract_text(file_path):
    """ Extracts text from PDFs and images """
    if file_path.lower().endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

    elif file_path.lower().endswith((".jpg", ".jpeg", ".png")):
        return pytesseract.image_to_string(Image.open(file_path))

    return "Unsupported file format"

def analyze_text_with_gpt(text):
    """ Sends extracted text to GPT-3.5 for analysis """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": f"Analyze this medical report and provide insights:\n{text}"}],
        max_tokens=500
    )
    return response["choices"][0]["message"]["content"]



@app.route("/")
def home():
    return render_template("index.html")

@app.route("/prediction")
def prediction():
    return render_template("prediction.html")

@app.route("/chatbot")
def chatbot():
    return render_template("chatbot.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")




@app.route("/chatbot", methods=["POST"])
def chatbot_response():
    try:
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"reply": "Sorry, I didn't receive a message. Please try again."})

        # Ensure the bot only responds to medical-related queries
        restriction_prompt = (
            "You are a medical AI assistant. Respond only to medical-related queries. "
            "If the user asks something unrelated to medical topics, reply with: "
            "'Please ask only medical-related questions.'"
        )

        # Send user message to OpenAI GPT-3.5 Turbo
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": restriction_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150
        )

        reply = response["choices"][0]["message"]["content"].strip()
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": "Sorry, something went wrong. Please try again."})



@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"})

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    # Extract text from file
    extracted_text = extract_text(file_path)

    # Send text to GPT-3.5 for analysis
    analysis = analyze_text_with_gpt(extracted_text)

    return jsonify({"analysis": analysis})

@app.route("/predict", methods=["POST"])
def predict():
    """Handles prediction requests"""
    try:
        input_data = request.json  # Get input data from frontend
        disease = input_data.pop("disease") #Get selected disease
        if disease not in models:
            return jsonify({"error": "Invalid input data"}), 400
        

        model_info = models[disease]
        model = model_info["model"]
        feature_names = model_info["feature_names"]
        scaler = model_info.get("scaler")

        values = [float(input_data.get(feature, 0)) for feature in feature_names]  # Convert to float

        # Convert to DataFrame with correct feature names
        input_df = pd.DataFrame([values], columns=feature_names)  

        # # Apply the same scaling as in training
        # if scaler:
        #     input_df = scaler.transform(input_df)
        
        # # Convert input data to match training format
        # input_array = input_df.to_numpy()  # Remove feature names

        # Make Prediction
        prediction = model.predict(input_df)[0]

        result = "Disease Present" if prediction == 1 else "No Disease"

        return jsonify({"result": result})  # Send result back to frontend

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# Load Pneumonia Model
pneumonia_model = load_model("models/pneumonia.h5")

def preprocess_image(image_path):
    img = load_img(image_path, target_size=(150, 150))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

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



if __name__ == "__main__":
    app.run(debug=True)