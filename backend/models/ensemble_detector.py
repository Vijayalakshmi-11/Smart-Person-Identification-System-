import cv2
import numpy as np
from models.yolo_face import YOLOFace
from models.face_model import FaceModel


class EnsembleDetector:
    def __init__(self):
        print("\n===============================")
        print("🟦 Initializing Ensemble Detector")
        print("===============================\n")

        # Initialize YOLO face detector (already padded version)
        self.yolo = YOLOFace()

        # Initialize MobileFaceNet recognizer
        self.face_model = FaceModel()

        print("🟩 Ensemble Detector READY.\n")

    def detect_and_embed(self, frame):
        """
        Run YOLO, enlarge crops, and extract embeddings using MobileFaceNet.
        Returns: 
            crops → list of face images
            boxes → list of bounding boxes
            embeddings → list of 512-d embeddings
        """

        print("\n🟦 [Ensemble] Running YOLO face detection...")
        crops, boxes = self.yolo.detect(frame)

        embeddings = []

        if len(crops) == 0:
            print("🔴 [Ensemble] YOLO returned NO faces")
            return [], [], []

        print(f"🟩 [Ensemble] YOLO returned {len(crops)} crops")

        for i, crop in enumerate(crops):
            print(f"\n🟨 Processing crop #{i+1}...")

            if crop is None or crop.size == 0:
                print("🔴 Crop is empty. Skipping.")
                embeddings.append(None)
                continue

            # Extract embedding using MobileFaceNet
            embedding = self.face_model.extract_embedding(crop)

            if embedding is None:
                print("🔴 [Ensemble] No embedding extracted for this face.")
            else:
                print("🟢 [Ensemble] Embedding extracted successfully!")

            embeddings.append(embedding)

        print("\n🟩 [Ensemble] Finished processing all faces.\n")

        return crops, boxes, embeddings
