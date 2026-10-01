import time

LAST_SIGHTING_TIME = {}
SIGHTING_COOLDOWN = 30  # seconds

from models.yolo_face import YOLOFace
import models.face_model as face_model_module

print("\n🟦 Loading shared YOLO + FaceModel instances...")

yolo_face = YOLOFace()
face_model = face_model_module.FaceModel()

print("🟢 Shared models ready!\n")
