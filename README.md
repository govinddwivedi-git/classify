# Classify - AI-Powered Music Genre Classification

Classify is a full-stack web application that uses a deep learning model to predict the genre of an audio file. The frontend is built with React, TypeScript, and Vite, and the backend is a Python Flask server that serves a trained TensorFlow/Keras model.

## Features

- **Drag-and-Drop File Upload**: Easily upload audio files for classification.
- **Real-Time Prediction**: Get instant genre predictions from the AI model.
- **Classification History**: View a log of your past classifications.
- **Responsive UI**: Modern and clean interface that works on all devices.
- **RESTful API**: A simple and effective Flask backend to serve the model.

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   └── cnn_2d.h5
│   ├── src/
│   │   ├── app.py             # Flask API logic
│   │   └── gtzan/             # Data processing and model utilities
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Script to start the backend server
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── pages/
    │   │   └── Index.tsx      # Main React component for the UI
    │   └── App.tsx            # Main application component with routing
    ├── package.json           # Node.js dependencies
    └── vite.config.ts         # Vite configuration
```

---

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- **Node.js** (v18 or later)
- **Python** (v3.9 or later) and `pip`
- A virtual environment tool for Python (like `venv`)

### 1. Backend Setup

First, set up and run the Flask API server.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv_songs
source venv_songs/bin/activate  # On Windows: venv_songs\Scripts\activate

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Start the backend server
python run.py
```

The backend API will now be running at `http://localhost:5000`. Keep this terminal open.

### 2. Frontend Setup

Next, set up and run the React frontend in a **new terminal window**.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install the required Node.js packages
npm install

# 3. Start the frontend development server
npm run dev
```

The frontend application will now be running at `http://localhost:5173`.

---

## How to Use

1.  **Open the Application**: Navigate to `http://localhost:5173` in your web browser.
2.  **Upload an Audio File**: Drag and drop an audio file (`.mp3`, `.wav`, etc.) onto the upload area, or click to browse your files.
3.  **Classify**: Click the "Classify Genre" button.
4.  **View Results**: The predicted genre and confidence score will be displayed. Your classification will also be added to the "History" tab.

## API Endpoint

The backend provides one main endpoint for predictions.

### `POST /api/predict`

Accepts an audio file and returns the predicted genre.

- **URL**: `http://localhost:5000/api/predict`
- **Method**: `POST`
- **Body**: `multipart/form-data` with a single field:
  - `audio`: The audio file to be classified.

#### Example Success Response:

```json
{
  "success": true,
  "data": {
    "filename": "my_song.mp3",
    "predicted_genre": "Rock",
    "confidence": 0.92,
    "top_genres": [
      ["Rock", 0.92],
      ["Pop", 0.05],
      ["Metal", 0.02]
    ]
  }
}
```

#### Example Error Response:

```json
{
  "success": false,
  "error": "File type not supported."
}
```

---

## Model Details

The classification model is a 2D Convolutional Neural Network (CNN) trained on the GTZAN dataset. It can identify the following 10 genres:

- Blues
- Classical
- Country
- Disco
- Hip-hop
- Jazz
- Metal
- Pop
- Reggae
- Rock

## Troubleshooting

- **`Address already in use` error**: This means another process is using port 5000. Find and stop that process, or change the port in `backend/src/app.py`.
- **Frontend connection errors**: Make sure the backend server is running *before* you try to classify a file.
- **Model not found**: Ensure the `custom_cnn_2d.h5` file is located in the `backend/models/` directory and that you are running `run.py` from the `backend` directory.
- **Dependency issues**: If you encounter errors during installation, make sure your Python and Node.js versions meet the prerequisites. Try deleting `node_modules` or the Python `venv` and reinstalling.

## Dataset used
GTZAN dataset: https://www.kaggle.com/datasets/andradaolteanu/gtzan-dataset-music-genre-classification