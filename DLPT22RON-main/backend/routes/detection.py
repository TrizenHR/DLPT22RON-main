from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64
from services.yolo_service import YOLOService

yolo_bp = Blueprint('yolo', __name__)
yolo_service = YOLOService()

@yolo_bp.route('/api/yolo/detect', methods=['POST', 'OPTIONS'])
def yolo_detect():
    """YOLO-based detection endpoint that detects all objects, persons, and traffic signs"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        image_data = data['frame'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        result = yolo_service.detect_objects(frame)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in yolo_detect: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@yolo_bp.route('/api/yolo/detect_objects', methods=['POST', 'OPTIONS'])
def yolo_detect_objects():
    """YOLO endpoint that returns only objects (excluding persons and traffic signs)"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        image_data = data['frame'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        result = yolo_service.detect_objects(frame)
        # Return only objects, not persons or traffic signs
        return jsonify({
            "objects": result["objects"],
            "frame_height": result["frame_height"],
            "frame_width": result["frame_width"]
        })
        
    except Exception as e:
        print(f"Error in yolo_detect_objects: {str(e)}")
        return jsonify({"error": str(e)}), 500

@yolo_bp.route('/api/yolo/detect_persons', methods=['POST', 'OPTIONS'])
def yolo_detect_persons():
    """YOLO endpoint that returns only persons"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        image_data = data['frame'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        result = yolo_service.detect_objects(frame)
        # Return only persons
        return jsonify({
            "persons": result["persons"],
            "person_count": result["person_count"],
            "frame_height": result["frame_height"],
            "frame_width": result["frame_width"]
        })
        
    except Exception as e:
        print(f"Error in yolo_detect_persons: {str(e)}")
        return jsonify({"error": str(e)}), 500

@yolo_bp.route('/api/yolo/detect_traffic_signs', methods=['POST', 'OPTIONS'])
def yolo_detect_traffic_signs():
    """YOLO endpoint that returns only traffic signs"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        image_data = data['frame'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        result = yolo_service.detect_objects(frame)
        # Return only traffic signs
        return jsonify({
            "traffic_signs": result["traffic_signs"],
            "frame_height": result["frame_height"],
            "frame_width": result["frame_width"]
        })
        
    except Exception as e:
        print(f"Error in yolo_detect_traffic_signs: {str(e)}")
        return jsonify({"error": str(e)}), 500