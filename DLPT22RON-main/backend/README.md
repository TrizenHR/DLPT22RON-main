# VisionGuide Backend

## Overview

VisionGuide is an AI-powered navigation assistance system designed for visually impaired users. The backend provides RESTful APIs for real-time object detection, person counting, text-to-speech, translation, and user profile management.

## Project Architecture

The backend follows a modular Flask architecture with clear separation of concerns:
- **Routes**: API endpoints and request handling
- **Services**: Business logic and ML model integration
- **Utils**: Utility functions (distance calculation, etc.)
- **Models**: Pre-trained ML models and datasets

## Technology Stack

- **Framework**: Flask (Python 3.10.7+)
- **Computer Vision**: OpenCV, PyTorch, Torchvision, Ultralytics (YOLO)
- **ML Models**: 
  - SSD MobileNet V3 (Object Detection)
  - Faster R-CNN ResNet-50 FPN (Person Detection)
  - YOLOv8 (Alternative detection)
  - mBART-50 (Translation)
- **TTS**: gTTS (Google Text-to-Speech)
- **Data Format**: JSON for user profiles

## Project Structure

```
backend/
├── app.py                      # Main Flask application entry point
├── requirements.txt            # Python dependencies
├── routes/                     # API route handlers
│   ├── object_route.py        # Object detection endpoints
│   ├── person_route.py        # Person detection endpoints
│   ├── detection.py           # YOLO-based detection endpoints
│   ├── speech.py              # Text-to-speech endpoints
│   ├── translation_route.py   # Translation endpoints
│   └── profile_route.py       # User profile endpoints
├── services/                   # Business logic layer
│   ├── object_service.py      # Object detection service (SSD MobileNet)
│   ├── person_service.py      # Person detection service (Faster R-CNN)
│   ├── yolo_service.py        # YOLO detection service
│   └── translation_service.py # Translation service (mBART-50)
├── utils/                      # Utility functions
│   └── distance.py            # Distance calculation utilities
├── src/                        # Static resources
│   ├── dataset/               # COCO dataset files
│   │   ├── coco.names        # COCO class names (91 classes)
│   │   └── average_sizes.txt  # Average object sizes for distance calc
│   └── models/               # Pre-trained model files
│       ├── ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt
│       ├── frozen_inference_graph.pb
│       └── yolov8n.pt
├── models/                     # Translation model
│   └── mbart_model/          # mBART-50 model files
└── data/                      # User data storage
    └── userData.json         # User profile data (JSON)
```

## Modules Overview

### 1. Routes (`routes/`)

#### `object_route.py`
- **Purpose**: Object detection using SSD MobileNet V3
- **Endpoints**:
  - `POST /detect_frame` - Detect objects in a frame
- **Input**: Base64-encoded image frame
- **Output**: JSON with detected objects, positions, distances, confidence scores

#### `person_route.py`
- **Purpose**: Person detection and counting using Faster R-CNN
- **Endpoints**:
  - `POST /api/detect_persons` - Detect persons in a frame
  - `POST /api/detect_frame` - Alternative person detection endpoint
  - `GET /api/model_status` - Check if person detection model is ready
- **Input**: Base64-encoded image frame
- **Output**: JSON with detected persons, count, positions, distances

#### `detection.py`
- **Purpose**: YOLO-based unified detection (objects + persons)
- **Endpoints**:
  - `POST /api/yolo/detect` - Detect all objects and persons
  - `POST /api/yolo/detect_objects` - Detect only objects (excludes persons)
  - `POST /api/yolo/detect_persons` - Detect only persons
- **Input**: Base64-encoded image frame
- **Output**: JSON with combined detection results

#### `speech.py`
- **Purpose**: Text-to-speech conversion using gTTS
- **Endpoints**:
  - `POST /api/speak` - Convert text to speech audio
- **Input**: JSON with `text` and `language` (en, te, hi, ja, zh, es)
- **Output**: MP3 audio file (binary)

#### `translation_route.py`
- **Purpose**: Text translation using mBART-50
- **Endpoints**:
  - `POST /api/translate` - Translate text between languages
- **Input**: JSON with `text`, `source_lang`, `target_lang`
- **Output**: JSON with translated text

#### `profile_route.py`
- **Purpose**: User profile management
- **Endpoints**:
  - `GET /api/profile` - Get user profile
  - `POST /api/profile` - Update user profile
- **Input/Output**: JSON user profile data

### 2. Services (`services/`)

#### `object_service.py`
- **Model**: SSD MobileNet V3 Large COCO
- **Features**:
  - Detects 91 COCO classes (person, chair, remote, etc.)
  - Calculates distance using focal length and object size
  - Determines position (left, center, right)
  - Confidence threshold: 0.4
- **Key Methods**:
  - `detect_objects(frame)` - Main detection method
  - `calculate_distance(object_width, real_width)` - Distance calculation
  - `get_position(frame_width, box)` - Position determination

#### `person_service.py`
- **Model**: Faster R-CNN ResNet-50 FPN (PyTorch)
- **Features**:
  - Specialized person detection
  - Person counting
  - Distance calculation based on bounding box height
  - Confidence threshold: 0.6
- **Key Methods**:
  - `detect_persons(frame)` - Person detection
  - `is_model_ready()` - Check model loading status

#### `yolo_service.py`
- **Model**: YOLOv8 Nano
- **Features**:
  - Unified detection (objects + persons in one pass)
  - Better small object detection (e.g., remotes)
  - Same COCO classes as object_service
  - Confidence threshold: 0.4
- **Key Methods**:
  - `detect_objects(frame)` - Combined detection

#### `translation_service.py`
- **Model**: mBART-50 (Hugging Face Transformers)
- **Features**:
  - Multi-language translation
  - Supports 50 languages
- **Key Methods**:
  - `translate(text, source_lang, target_lang)` - Translation

### 3. Utils (`utils/`)

#### `distance.py`
- **Purpose**: Distance calculation utilities
- **Methods**:
  - `calculate_distance(height)` - Calculate distance from camera using person height
- **Constants**:
  - `KNOWN_HEIGHT = 1.7m` (average person height)
  - `FOCAL_LENGTH = 615` (camera focal length)

## API Endpoints Summary

### Object Detection
- `POST /detect_frame` - Detect objects (SSD MobileNet)

### Person Detection
- `POST /api/detect_persons` - Detect persons (Faster R-CNN)
- `GET /api/model_status` - Check person model status

### YOLO Detection (Alternative)
- `POST /api/yolo/detect` - Unified detection (objects + persons)
- `POST /api/yolo/detect_objects` - Objects only
- `POST /api/yolo/detect_persons` - Persons only

### Text-to-Speech
- `POST /api/speak` - Generate speech audio
  - Body: `{ "text": "string", "language": "en|te|hi|ja|zh|es" }`
  - Response: MP3 audio binary

### Translation
- `POST /api/translate` - Translate text
  - Body: `{ "text": "string", "source_lang": "en", "target_lang": "te" }`
  - Response: `{ "translated_text": "string" }`

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile
  - Body: `{ "name": "string", "language": "en", ... }`

## Setup Instructions

### Prerequisites
- Python 3.10.7 or higher
- pip package manager

### Installation

1. **Create virtual environment**:
```bash
cd backend
py -3.10 -m venv venv
venv/Scripts/activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Download models** (if not present):
   - YOLOv8 will auto-download on first use
   - mBART-50 model should be in `models/mbart_model/`
   - SSD MobileNet files should be in `src/models/`

4. **Run the server**:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Configuration

### CORS Settings
- Currently allows all origins (`*`)
- Configured in `app.py` for development
- Update for production deployment

### Model Paths
- Models are loaded from `src/models/` and `models/`
- Ensure model files are present before running

### Data Storage
- User profiles stored in `data/userData.json`
- JSON format for simple key-value storage

## How to Navigate the Codebase

### Adding a New Detection Endpoint
1. Create service in `services/` (if new model needed)
2. Create route in `routes/`
3. Register blueprint in `app.py`

### Adding a New Language for TTS
1. Add language code to `language_map` in `routes/speech.py`
2. Ensure gTTS supports the language

### Modifying Detection Logic
- Object detection: `services/object_service.py`
- Person detection: `services/person_service.py`
- YOLO detection: `services/yolo_service.py`

### Changing Distance Calculation
- Modify `utils/distance.py` or service-specific calculation methods

## Key Files to Understand

1. **`app.py`** - Start here to see all registered routes
2. **`routes/object_route.py`** - Example route implementation
3. **`services/object_service.py`** - Example service with ML model
4. **`utils/distance.py`** - Distance calculation logic

## Notes

- Models are loaded on first request (lazy loading)
- SSD MobileNet uses OpenCV DNN
- Faster R-CNN uses PyTorch
- YOLO uses Ultralytics library
- All image inputs are base64-encoded JPEG frames
- Distance calculations use average object sizes from `average_sizes.txt`
