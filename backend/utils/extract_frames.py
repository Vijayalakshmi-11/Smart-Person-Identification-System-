# utils/extract_frames.py
# CCTV-optimized frame extractor with quality filtering

import cv2
import numpy as np



def is_blurry(frame, threshold=120.0):
    """Return True if frame is blurry (detect blur using Laplacian variance)."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    return score < threshold


def enhance_cctv_frame(frame):
    """Fix brightness, contrast, and noise."""
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    # CLAHE improves visibility in dark CCTV
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l = clahe.apply(l)

    enhanced = cv2.merge((l, a, b))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    return enhanced

# utils/extract_frames.py
import cv2

def extract_frames_batch(video_path, frame_interval=20, max_frames=60):
    frames = []
    cap = cv2.VideoCapture(video_path)

    index = 0
    while cap.isOpened() and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if index % frame_interval == 0:
            frames.append(frame)

        index += 1

    cap.release()
    return frames



def is_valid_video_file(path):
    return path.lower().endswith((".mp4", ".avi", ".mov", ".mkv"))


def is_valid_image_file(path):
    return path.lower().endswith((".jpg", ".jpeg", ".png"))


def load_image(path):
    img = cv2.imread(path)
    if img is not None:
        img = enhance_cctv_frame(img)   # preprocess images too
    return img
