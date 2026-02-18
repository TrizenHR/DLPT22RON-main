import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import os

class YOLOService:
    # COCO class IDs that are traffic-related
    TRAFFIC_COCO_IDS = {9, 11, 12, 13}  # traffic light, stop sign, parking meter, fire hydrant

    def __init__(self):
        # Get the current file's directory
        current_dir = Path(__file__).parent.parent
        

        
        # Load class names (YOLO uses COCO classes in same order)
        self.classFile = str(current_dir / 'src/dataset/coco.names')
        with open(self.classFile, 'rt') as f:
            self.classNames = f.read().rstrip('\n').split('\n')

        # Load average sizes for distance calculation
        self.average_sizes_file = str(current_dir / 'src/dataset/average_sizes.txt')
        self.average_sizes = {}
        with open(self.average_sizes_file, 'rt') as f:
            for line in f:
                obj, size = line.strip().split(',')
                self.average_sizes[obj.strip()] = float(size.strip())

        # ── Load YOLO model ── upgraded to yolo11m for much better accuracy ──

        model_name = 'yolo11m.pt'
        general_paths = [
            str(current_dir / f'src/models/{model_name}'),
            str(current_dir / f'models/{model_name}'),
            model_name
        ]

        self.general_model = None
        for model_path in general_paths:
            if os.path.exists(model_path):
                try:
                    self.general_model = YOLO(model_path)
                    break
                except Exception as e:
                    pass

        if self.general_model is None:
            self.general_model = YOLO(model_name)

        # Load traffic sign detection model (optional fallback)

        traffic_paths = [
            str(current_dir / 'src/models/traffic_sign_detection.pt'),
            str(current_dir / 'models/traffic_sign_detection.pt'),
            str(current_dir / 'traffic_sign_detection.pt'),
            'traffic_sign_detection.pt'
        ]

        self.traffic_model = None
        for model_path in traffic_paths:
            if os.path.exists(model_path):
                try:
                    self.traffic_model = YOLO(model_path)
                    break
                except Exception as e:
                    pass
        

        
        # Confidence thresholds
        self.general_conf_threshold = 0.35  # Lowered from 0.4 for better recall
        self.traffic_conf_threshold = 0.25
        self.focal_length = 615
        


    def calculate_distance(self, object_width, real_width):
        """Calculate distance using focal length and object width"""
        return (real_width * self.focal_length) / (object_width + 1e-6)

    def get_position(self, frame_width, center_x):
        """Determine position in frame (left, center, right)"""
        if center_x < frame_width // 3:
            return "left"
        elif center_x < 2 * (frame_width // 3):
            return "center"
        else:
            return "right"

    def detect_objects(self, frame):
        """Detect all objects in frame using YOLO models"""
        frame_height, frame_width = frame.shape[:2]
        
        objects = []
        persons = []
        traffic_signs = []
        person_count = 0
        
        # 1. Run general object detection with yolo11m
        try:
            general_results = self.general_model(frame, conf=self.general_conf_threshold, verbose=False)
            
            for result in general_results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    w = x2 - x1
                    h = y2 - y1
                    center_x = (x1 + x2) / 2
                    
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    if class_id < len(self.classNames):
                        label = self.classNames[class_id].lower()
                    else:
                        continue
                    
                    # Calculate distance
                    distance = None
                    if label in self.average_sizes:
                        real_width = self.average_sizes[label]
                        distance = self.calculate_distance(w, real_width)
                    
                    position = self.get_position(frame_width, center_x)
                    
                    detection = {
                        "label": label,
                        "confidence": confidence,
                        "position": position,
                        "distance": f"{distance:.1f}m" if distance else None,
                        "box": [x1, y1, x2, y2]
                    }
                    
                    # Classify: person / traffic sign / general object
                    if class_id == 0:  # Person class
                        person_count += 1
                        detection["label"] = f"Person {person_count}"
                        persons.append(detection)
                    elif class_id in self.TRAFFIC_COCO_IDS:
                        # Traffic-related from COCO (traffic light, stop sign, etc.)
                        detection["type"] = "traffic_sign"
                        traffic_signs.append(detection)
                    else:
                        objects.append(detection)
                        
        except Exception as e:
            print(f"Error in general detection: {e}")
        
        # 2. Run traffic sign detection with custom model (if available)
        if self.traffic_model:
            try:
                traffic_results = self.traffic_model(frame, conf=self.traffic_conf_threshold, verbose=False)
                
                for result in traffic_results:
                    boxes = result.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                        w = x2 - x1
                        h = y2 - y1
                        center_x = (x1 + x2) / 2
                        
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        if hasattr(self.traffic_model, 'names') and class_id in self.traffic_model.names:
                            label = self.traffic_model.names[class_id].lower()
                        else:
                            label = f"traffic_sign_{class_id}"
                        
                        real_width = 0.6
                        distance = self.calculate_distance(w, real_width)
                        position = self.get_position(frame_width, center_x)
                        
                        traffic_sign = {
                            "label": label,
                            "confidence": confidence,
                            "position": position,
                            "distance": f"{distance:.1f}m" if distance else None,
                            "box": [x1, y1, x2, y2],
                            "type": "traffic_sign"
                        }
                        traffic_signs.append(traffic_sign)
                        
            except Exception as e:
                print(f"Error in traffic sign detection: {e}")
        
        return {
            "objects": objects,
            "persons": persons,
            "traffic_signs": traffic_signs,
            "person_count": person_count,
            "frame_height": frame_height,
            "frame_width": frame_width
        }