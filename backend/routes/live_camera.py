import sys
import os

# Ensure backend folder is visible
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import cv2

# Shared model instances
from utils.shared import yolo_face, face_model

# DB utilities
from utils.db_utils import get_persons_from_db, match_embedding
from utils.supabase_client import supabase

router = APIRouter(
    prefix="/live",
    tags=["Live Camera"]
)

# -----------------------------------------------------------
# Frame generator (OPTIMIZED, LOGIC UNCHANGED)
# -----------------------------------------------------------
def generate_frames():
    print("📷 Live camera started...")

    persons = get_persons_from_db(supabase)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Cannot access webcam!")
        return

    FRAME_SKIP = 5
    frame_count = 0
    last_results = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # Run heavy ops only every N frames
        if frame_count % FRAME_SKIP == 0:
            last_results = []

            small = cv2.resize(frame, (640, 480))
            _, boxes = yolo_face.detect(small)

            h_ratio = frame.shape[0] / 480
            w_ratio = frame.shape[1] / 640

            for (x1, y1, x2, y2) in boxes:
                # scale back
                x1 = int(x1 * w_ratio)
                x2 = int(x2 * w_ratio)
                y1 = int(y1 * h_ratio)
                y2 = int(y2 * h_ratio)

                crop = frame[y1:y2, x1:x2]
                emb = face_model.extract_embedding(crop)

                if emb is not None:
                    person, score = match_embedding(emb, persons)
                    last_results.append((x1, y1, x2, y2, person, score))

        # Draw cached results
        for (x1, y1, x2, y2, person, score) in last_results:
            if person:
                label = f"{person['name']} ({score:.2f})"
                color = (0, 255, 0)
            else:
                label = "UNKNOWN"
                color = (0, 0, 255)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" +
            frame_bytes +
            b"\r\n"
        )

    cap.release()

# -----------------------------------------------------------
# Live camera endpoint
# -----------------------------------------------------------
@router.get("/camera")
def live_camera():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
