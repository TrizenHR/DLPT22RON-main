import os
import tempfile
from flask import Blueprint, request, jsonify
from services.image_service import ImageService

image_bp = Blueprint('image', __name__)

# Lazy initialization — will be set when the app starts
_image_service = None

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'bmp', 'webp'}


def _get_image_service():
    """Lazy-init image service, reusing the yolo_service from the detection blueprint."""
    global _image_service
    if _image_service is None:
        # Import here to reuse the same YOLOService instance from detection.py
        from routes.detection import yolo_service
        _image_service = ImageService(yolo_service)
    return _image_service


def _allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@image_bp.route('/api/image/upload', methods=['POST', 'OPTIONS'])
def upload_image():
    """Upload an image file, process it with YOLO, return annotated image."""
    if request.method == 'OPTIONS':
        return '', 204

    if 'image' not in request.files:
        return jsonify({"error": "No image file in request"}), 400

    file = request.files['image']
    if file.filename == '' or not _allowed_file(file.filename):
        return jsonify({"error": f"Invalid file. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    try:
        # Save to temp file
        ext = file.filename.rsplit('.', 1)[1].lower()
        tmp = tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False)
        file.save(tmp.name)
        tmp.close()

        # Process the image
        svc = _get_image_service()
        result = svc.process_image(tmp.name)
        return jsonify(result)

    except Exception as e:
        print(f"Error processing image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
