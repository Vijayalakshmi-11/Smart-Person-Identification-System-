import cv2
import numpy as np
from ultralytics import YOLO

DEBUG = False

class YOLOFace:
    def __init__(self, model_path="models/yolov8n-face.pt"):
        if DEBUG:
            print("\n🟦 Initializing YOLO Face Detector...")
        self.model = YOLO(model_path)
        if DEBUG:
            print("🟩 YOLO model loaded successfully.\n")

    def detect(self, frame):
        h, w = frame.shape[:2]
        results = self.model(frame, verbose=False)[0]

        boxes = []
        crops = []

        for det in results.boxes:
            x1, y1, x2, y2 = det.xyxy[0].cpu().numpy().astype(int)

            face_w = x2 - x1
            face_h = y2 - y1

            if face_w < 8 or face_h < 8:
                continue

            pad = int(max(face_w, face_h) * 1.2)

            nx1 = max(0, x1 - pad)
            ny1 = max(0, y1 - pad)
            nx2 = min(w, x2 + pad)
            ny2 = min(h, y2 + pad)

            crop = frame[ny1:ny2, nx1:nx2]
            if crop.size == 0:
                continue

            boxes.append((nx1, ny1, nx2, ny2))
            crops.append(crop)

        return crops, boxes
