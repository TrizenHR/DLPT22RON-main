import os
import tempfile
from flask import Blueprint, request, jsonify
from services.video_service import VideoService

video_bp = Blueprint('video', __name__)

# Lazy initialization — will be set when the app starts
_video_service = None

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}


def _get_video_service():
    """Lazy-init video service, reusing the yolo_service from the detection blueprint."""
    global _video_service
    if _video_service is None:
        # Import here to reuse the same YOLOService instance from detection.py
        from routes.detection import yolo_service
        _video_service = VideoService(yolo_service)
    return _video_service


def _allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@video_bp.route('/api/video/upload', methods=['POST', 'OPTIONS'])
def upload_video():
    """Upload a video file, process it with YOLO, return annotated screenshots."""
    if request.method == 'OPTIONS':
        return '', 204

    if 'video' not in request.files:
        return jsonify({"error": "No video file in request"}), 400

    file = request.files['video']
    if file.filename == '' or not _allowed_file(file.filename):
        return jsonify({"error": f"Invalid file. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    try:
        # Save to temp file
        ext = file.filename.rsplit('.', 1)[1].lower()
        tmp = tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False)
        file.save(tmp.name)
        tmp.close()

        # Process the video
        svc = _get_video_service()
        result = svc.process_video(tmp.name, frame_interval=30)
        return jsonify(result)

    except Exception as e:
        print(f"Error processing video: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
