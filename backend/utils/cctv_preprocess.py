# utils/cctv_preprocess.py

import cv2
import numpy as np

class CCTVPreprocessor:
    def __init__(self):
        pass

    # ----------------------------------------
    # 1️⃣ Motion blur reduction (sharpening)
    # ----------------------------------------
    def sharpen(self, img):
        kernel = np.array([[0, -1, 0],
                           [-1, 5, -1],
                           [0, -1, 0]])
        return cv2.filter2D(img, -1, kernel)

    # ----------------------------------------
    # 2️⃣ Exposure fix (brighten dark CCTV video)
    # ----------------------------------------
    def fix_exposure(self, img):
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)

        v = cv2.equalizeHist(v)  # normalize brightness

        hsv = cv2.merge([h, s, v])
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    # ----------------------------------------
    # 3️⃣ Contrast improvement
    # ----------------------------------------
    def enhance_contrast(self, img):
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)

        lab = cv2.merge((l, a, b))
        return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # ----------------------------------------
    # 4️⃣ Final pipeline
    # ----------------------------------------
    def preprocess(self, img):
        img = self.fix_exposure(img)
        img = self.enhance_contrast(img)
        img = self.sharpen(img)
        return img


# Global instance
cctv_pre = CCTVPreprocessor()
