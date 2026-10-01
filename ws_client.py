import cv2
import base64
import numpy as np
from websocket import create_connection

# Connect to WebSocket server
ws = create_connection("ws://127.0.0.1:8000/live/ws")
print("🟢 Connected to live camera WebSocket")

while True:
    data = ws.recv()
    jpg = base64.b64decode(data)
    img = cv2.imdecode(np.frombuffer(jpg, np.uint8), cv2.IMREAD_COLOR)

    cv2.imshow("Live (Real-Time)", img)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
        break

ws.close()
cv2.destroyAllWindows()
