import cv2
import numpy as np
import os
import time
from pathlib import Path
from services.yolo_service import YOLOService


class VideoService:
    """Processes uploaded videos: extracts frames, runs detection, saves annotated screenshots."""

    # Color scheme for bounding boxes (BGR for OpenCV)
    COLOR_OBJECT = (0, 200, 0)        # Green
    COLOR_PERSON = (200, 0, 200)      # Purple
    COLOR_TRAFFIC = (255, 140, 0)     # Blue-ish

    def __init__(self, yolo_service: YOLOService):
        self.yolo_service = yolo_service
        self.static_dir = Path(__file__).parent.parent / 'static' / 'video_results'
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def process_video(self, video_path: str, frame_interval: int = 30):
        """
        Process a video file: extract frames, run detection, save annotated screenshots.

        Args:
            video_path:      Path to uploaded video file.
            frame_interval:  Extract one frame every N frames (default 30 ≈ 1 per second at 30fps).

        Returns:
            dict with summary counts and list of screenshot info.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Create output folder for this run
        run_id = str(int(time.time()))
        output_dir = self.static_dir / run_id
        output_dir.mkdir(parents=True, exist_ok=True)

        screenshots = []
        total_objects = 0
        total_persons = 0
        total_traffic_signs = 0
        frame_idx = 0
        processed = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                # Run detection
                result = self.yolo_service.detect_objects(frame)

                # Count totals
                n_obj = len(result["objects"])
                n_per = result["person_count"]
                n_sign = len(result["traffic_signs"])
                total_objects += n_obj
                total_persons += n_per
                total_traffic_signs += n_sign

                # Draw bounding boxes on the frame
                annotated = self._draw_detections(frame.copy(), result)

                # Save screenshot
                timestamp_sec = round(frame_idx / fps, 1)
                filename = f"frame_{processed:04d}_t{timestamp_sec}s.jpg"
                filepath = output_dir / filename
                cv2.imwrite(str(filepath), annotated, [cv2.IMWRITE_JPEG_QUALITY, 90])

                screenshots.append({
                    "filename": filename,
                    "url": f"/static/video_results/{run_id}/{filename}",
                    "frame_number": frame_idx,
                    "timestamp": f"{timestamp_sec}s",
                    "objects_count": n_obj,
                    "persons_count": n_per,
                    "traffic_signs_count": n_sign,
                    "detections": {
                        "objects": result["objects"],
                        "persons": result["persons"],
                        "traffic_signs": result["traffic_signs"],
                    }
                })
                processed += 1

            frame_idx += 1

        cap.release()

        # Clean up uploaded video
        try:
            os.remove(video_path)
        except Exception:
            pass

        return {
            "total_frames_processed": processed,
            "total_video_frames": total_frames,
            "fps": fps,
            "summary": {
                "total_objects": total_objects,
                "total_persons": total_persons,
                "total_traffic_signs": total_traffic_signs,
            },
            "screenshots": screenshots,
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

    @staticmethod
    def _draw_box(frame, det, color, font, font_scale, thickness):
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
