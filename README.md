# AI-Driven Multiple Disease Prediction

This project is an intelligent medical assistant designed to predict diseases using trained Machine Learning models and provide real-time health advice via a conversational chatbot. Users can input parameters for diseases or upload medical reports (PDF/image), and interact with an AI assistant for recommendations and analysis.

---

# Features

- 🩺 **Disease Prediction** for:
  - Heart Disease
  - Diabetes
  - Liver Disease
  - Kidney Disease
  - Pneumonia (image-based X-ray prediction)
  
- **Upload Medical Reports** (PDF, JPG, PNG)
- **Chatbot Assistant** for follow-up medical questions
- **Real-Time Medical Report Analysis** using Ollama
- Web-based Interface with a clean and modern UI

---

## 🛠️ Tech Stack

### Backend
- **Python**, **Flask**
- **Machine Learning**: Scikit-learn, TensorFlow/Keras, oneDNN
- **OCR & PDF Tools**: `PyMuPdf`, `pytesseract`
- **LLM Integration**: local model via Ollama

### Frontend
- **HTML5**, **CSS3**, **JavaScript**
- Minimalist design with responsive layout

---

## 📁 Project Structure
Final Year Project/
├── static/
│ ├── script-chatbot.js
│ ├── script.js
│ └── styles.css
├── templates/
│ ├── index.html
│ ├── prediction.html
│ ├── chatbot.html
│ └── contact.html
├── models/
│ ├── heart.pkl
│ ├── diabetes.pkl
│ ├── kidney.pkl
│ ├── liver.pkl
│ └── pneumonia.h5
├── app.py
├── requirements.txt
└── README.md

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/AmeyKarwarker/Final-Year-Project.git
cd Final-Year-Project

### 2. Install Dependencies
pip install -r requirements.txt

### 3. Run the application
python app.py
```

---



