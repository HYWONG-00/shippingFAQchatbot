from flask import Flask
from flask_cors import CORS
from apps.routes import api_bp
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for React frontend (localhost:3000)
    
    # Register the API blueprint
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app