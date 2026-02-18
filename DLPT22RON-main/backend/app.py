
from flask import Flask
from flask_cors import CORS
from routes.person_route import person_bp
from routes.object_route import object_bp
from routes.profile_route import profile_bp
from routes.translation_route import translation_bp
from routes.detection import yolo_bp
from routes.video_route import video_bp
from routes.image_route import image_bp

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB max upload

CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Register individual route blueprints
app.register_blueprint(person_bp, url_prefix='/api')
app.register_blueprint(object_bp)  # Remove url_prefix to match the frontend request
app.register_blueprint(profile_bp, url_prefix='/api')
app.register_blueprint(translation_bp, url_prefix='/api')
app.register_blueprint(yolo_bp, url_prefix='/api')  # YOLO detection endpoints
app.register_blueprint(video_bp)  # Video upload endpoints (routes already prefixed /api)
app.register_blueprint(image_bp)  # Image upload endpoints

if __name__ == '__main__':
    app.run(debug=True, port=5000)
