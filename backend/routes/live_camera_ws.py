import cv2
import base64
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from utils.shared import yolo_face, face_model
from utils.db_utils import get_persons_from_db, match_embedding
from utils.supabase_client import supabase
from utils.db_utils import save_sighting_if_new

router = APIRouter(prefix="/live", tags=["Live Camera WS"])

@router.websocket("/ws")
async def live_camera_ws(websocket: WebSocket):
    await websocket.accept()
    print("🟢 WebSocket live camera connected")

    persons = get_persons_from_db(supabase)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        await websocket.close()
        return

    FRAME_SKIP = 3
    frame_count = 0
    last_results = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            if frame_count % FRAME_SKIP == 0:
                last_results = []
                small = cv2.resize(frame, (640, 480))
                _, boxes = yolo_face.detect(small)

                h_ratio = frame.shape[0] / 480
                w_ratio = frame.shape[1] / 640

                for (x1, y1, x2, y2) in boxes:
                    x1 = int(x1 * w_ratio)
                    x2 = int(x2 * w_ratio)
                    y1 = int(y1 * h_ratio)
                    y2 = int(y2 * h_ratio)

                    crop = frame[y1:y2, x1:x2]
                    emb = face_model.extract_embedding(crop)

                    if emb is not None:
                        person, score = match_embedding(emb, persons)
                        if person and score >= 0.45:
                            print("🟢 LIVE SAVE TRIGGERED:", person["id"], score)
                            save_sighting_if_new(
                                supabase,
                                person["id"],
                                score,
                                bbox=[int(x1), int(y1), int(x2), int(y2)],  # ✅ JSON safe
                                location="Live Camera"
                            )

                        last_results.append((x1, y1, x2, y2, person, score))


            for (x1, y1, x2, y2, person, score) in last_results:
                if person:
                    label = f"{person['name']} {score:.2f}"
                    color = (0, 255, 0)
                else:
                    label = "UNKNOWN"
                    color = (0, 0, 255)

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            encoded = base64.b64encode(buffer).decode("utf-8")

            await websocket.send_text(encoded)
            await asyncio.sleep(0)  # ultra-low latency

    except WebSocketDisconnect:
        print("🔴 WebSocket disconnected")

    finally:
        cap.release()
