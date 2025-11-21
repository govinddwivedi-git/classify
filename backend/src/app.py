import argparse
import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from gtzan import AppManager
from gtzan.data.make_dataset import make_dataset_dl
from gtzan.utils import majority_voting
from tensorflow.keras.models import load_model

# Constants
genres = {
    'metal': 0, 'disco': 1, 'classical': 2, 'hiphop': 3, 'jazz': 4, 
    'country': 5, 'pop': 6, 'blues': 7, 'reggae': 8, 'rock': 9
}

# Default model path (relative to src directory)
# Construct an absolute path to the model file
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(APP_ROOT, '..', 'models', 'cnn_2d.h5')

# Flask app configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure upload settings
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_genre(file_path):
    """Predict genre for a given audio file path"""
    try:
        # Check if model file exists
        if not os.path.exists(DEFAULT_MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {DEFAULT_MODEL_PATH}")
        
        # Create a simple args object for compatibility
        class Args:
            def __init__(self):
                self.type = "dl"  # Always use deep learning
                self.model = DEFAULT_MODEL_PATH
                self.song = file_path
        
        args = Args()
        
        # Load model and make prediction
        X = make_dataset_dl(args)
        model = load_model(DEFAULT_MODEL_PATH)
        preds = model.predict(X)
        votes = majority_voting(preds, genres)
        
        # Return structured result
        return {
            'predicted_genre': votes[0][0],
            'confidence': float(votes[0][1]),
            'top_genres': [(genre, float(prob)) for genre, prob in votes[:3]]
        }
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Music Genre Classification API is running'})

@app.route('/api/predict', methods=['POST'])
def predict_audio():
    """API endpoint to predict genre from uploaded audio file"""
    try:
        # Check if file is present in request (accept both 'audio' and 'file' field names)
        if 'audio' in request.files:
            file = request.files['audio']
        elif 'file' in request.files:
            file = request.files['file']
        else:
            return jsonify({'error': 'No audio file provided. Please use "audio" or "file" as the field name.'}), 400
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'File type not supported. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file.filename.rsplit(".", 1)[1].lower()}') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Predict genre
            result = predict_genre(temp_file_path)
            
            # Add filename to result
            result['filename'] = secure_filename(file.filename)
            
            return jsonify({
                'success': True,
                'data': result
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# @RUN: Main function to call the appmanager (for CLI usage)
def main(song_path):
    # Check if song file exists
    if not os.path.exists(song_path):
        raise FileNotFoundError(f"Song file not found: {song_path}")
    
    # Check if model file exists
    if not os.path.exists(DEFAULT_MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {DEFAULT_MODEL_PATH}")
    
    # Create a simple args object for compatibility
    class Args:
        def __init__(self):
            self.type = "dl"  # Always use deep learning
            self.model = DEFAULT_MODEL_PATH
            self.song = song_path
    
    args = Args()
    app_manager = AppManager(args, genres)
    app_manager.run()

if __name__ == '__main__':
    # Check if running as CLI or Flask app
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] != 'run':
        # CLI mode - Parse command line arguments
        parser = argparse.ArgumentParser(description='Music Genre Recognition using CNN Model')
        parser.add_argument('song', help='Path to song to classify', type=str)
        args = parser.parse_args()
        main(args.song)
    else:
        # Flask app mode
        print("Starting Music Genre Classification API...")
        print(f"Model path: {DEFAULT_MODEL_PATH}")
        print("API endpoints:")
        print("  GET  /api/health - Health check")
        print("  POST /api/predict - Upload audio file for genre prediction")
        app.run(debug=True, host='0.0.0.0', port=5000)