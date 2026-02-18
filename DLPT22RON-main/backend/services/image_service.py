import cv2
import numpy as np
import os
import time
from pathlib import Path
from services.yolo_service import YOLOService


class ImageService:
    """Processes uploaded images: runs detection, draws bounding boxes, saves annotated image."""

    # Color scheme for bounding boxes (BGR for OpenCV)
    COLOR_OBJECT = (0, 200, 0)        # Green
    COLOR_PERSON = (200, 0, 200)      # Purple
    COLOR_TRAFFIC = (255, 140, 0)     # Blue-ish

    def __init__(self, yolo_service: YOLOService):
        self.yolo_service = yolo_service
        self.static_dir = Path(__file__).parent.parent / 'static' / 'image_results'
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def process_image(self, image_path: str):
        """
        Process an image file: run detection, save annotated copy.

        Args:
            image_path: Path to uploaded image file.

        Returns:
            dict with detection summary and url to annotated image.
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not open image file")

        # Run detection
        result = self.yolo_service.detect_objects(img)

        # Draw bounding boxes
        annotated = self._draw_detections(img.copy(), result)

        # Save annotated image
        timestamp = int(time.time())
        filename = f"detected_{timestamp}.jpg"
        filepath = self.static_dir / filename
        cv2.imwrite(str(filepath), annotated, [cv2.IMWRITE_JPEG_QUALITY, 90])

        # Counts
        n_obj = len(result["objects"])
        n_per = result["person_count"]
        n_sign = len(result["traffic_signs"])

        # Clean up uploaded raw file
        try:
            os.remove(image_path)
        except Exception:
            pass

        return {
            "url": f"/static/image_results/{filename}",
            "width": result["frame_width"],
            "height": result["frame_height"],
            "summary": {
                "total_objects": n_obj,
                "total_persons": n_per,
                "total_traffic_signs": n_sign,
            },
            "detections": {
                "objects": result["objects"],
                "persons": result["persons"],
                "traffic_signs": result["traffic_signs"],
            }
        }

    def _draw_detections(self, frame, result):
        """Draw bounding boxes, labels, and distances on the frame."""
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness = 2

        # Draw objects (green)
        for det in result["objects"]:
            self._draw_box(frame, det, self.COLOR_OBJECT, font, font_scale, thickness)

        # Draw persons (purple)
        for det in result["persons"]:
            self._draw_box(frame, det, self.COLOR_PERSON, font, font_scale, thickness)

        # Draw traffic signs (blue)
        for det in result["traffic_signs"]:
            self._draw_box(frame, det, self.COLOR_TRAFFIC, font, font_scale, thickness)

        return frame

    def _draw_box(self, frame, det, color, font, font_scale, thickness):
        """Draw a single bounding box with label and distance."""
        x1, y1, x2, y2 = det["box"]
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

        # Build label text
        label = det["label"]
        conf = det["confidence"]
        dist = det.get("distance")
        text = f"{label} {conf:.0%}"
        if dist:
            text += f" | {dist}"

        # Background rectangle for text
        (tw, th), _ = cv2.getTextSize(text, font, font_scale, 1)
        cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
        cv2.putText(frame, text, (x1 + 2, y1 - 4), font, font_scale, (255, 255, 255), 1, cv2.LINE_AA)
