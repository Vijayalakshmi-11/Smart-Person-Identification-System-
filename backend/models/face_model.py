import cv2
import numpy as np
from insightface.app import FaceAnalysis


class FaceModel:
    def __init__(self):
        print("\n🟦 Initializing Face Recognition Model (buffalo_l)...")

        # Load SCRFD detector + MobileFaceNet embedding model
        self.app = FaceAnalysis(
            name="buffalo_l",
            providers=['CPUExecutionProvider']
        )

        # Prepare model (SCRFD 640x640)
        self.app.prepare(ctx_id=0, det_size=(640, 640))

        # MobileFaceNet always expects **112x112** for embeddings
        self.INPUT_SIZE = (112, 112)

        print("🟩 Face model loaded successfully (MobileFaceNet @112x112)\n")

    # ------------------------------------------------------------------
    # Extract a stable 512-D embedding from any YOLO crop
    # ------------------------------------------------------------------
    def extract_embedding(self, face_img):
        if face_img is None or face_img.size == 0:
            print("❌ extract_embedding(): empty or invalid face crop!")
            return None

        # -----------------------------
        # 🔥 FIX 1: ALWAYS resize to 112x112
        # -----------------------------
        try:
            resized = cv2.resize(face_img, self.INPUT_SIZE)
        except Exception as e:
            print("❌ Resize failed:", e)
            return None

        # -----------------------------
        # 🔥 FIX 2: Run InsightFace on resized image
        # -----------------------------
        faces = self.app.get(resized)

        if len(faces) == 0:
            print("❌ No face detected inside resized crop → cannot extract embedding")
            return None

        emb = faces[0].embedding

        if emb is None:
            print("❌ InsightFace returned None embedding")
            return None

        # Convert to float32 numpy array
        emb = np.array(emb, dtype=np.float32)

        print("🟢 Embedding extracted ✓ shape:", emb.shape)
        return emb
