#!/usr/bin/env python3
"""
Script to run the Music Genre Classification Flask API server
"""
import os
import sys

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import app

if __name__ == '__main__':
    print("=" * 60)
    print("🎵 Music Genre Classification API Server")
    print("=" * 60)
    print("Starting Flask server...")
    print("Server will be available at: http://localhost:5000")
    print("\nAPI Endpoints:")
    print("  GET  /api/health  - Health check")
    print("  POST /api/predict - Upload audio file for genre prediction")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)
