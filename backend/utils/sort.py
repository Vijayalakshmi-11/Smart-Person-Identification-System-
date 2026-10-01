# utils/sort.py
# Enhanced SORT for CCTV face tracking

import numpy as np
from filterpy.kalman import KalmanFilter
from scipy.optimize import linear_sum_assignment


def iou(bb_test, bb_gt):
    """Compute IoU between two boxes"""
    xx1 = max(bb_test[0], bb_gt[0])
    yy1 = max(bb_test[1], bb_gt[1])
    xx2 = min(bb_test[2], bb_gt[2])
    yy2 = min(bb_test[3], bb_gt[3])
    w = max(0., xx2 - xx1)
    h = max(0., yy2 - yy1)
    wh = w * h
    o = wh / (
        (bb_test[2]-bb_test[0])*(bb_test[3]-bb_test[1])
        + (bb_gt[2]-bb_gt[0])*(bb_gt[3]-bb_gt[1])
        - wh + 1e-6
    )
    return o


class TrackBox:
    """Track object with Kalman filter and state memory"""
    count = 0

    def __init__(self, bbox):
        # STATE: (cx, cy, s, r)
        # center x, center y, scale(area), aspect ratio
        self.kf = KalmanFilter(dim_x=7, dim_z=4)

        # State transition matrix
        self.kf.F = np.array([
            [1,0,0,0,1,0,0],
            [0,1,0,0,0,1,0],
            [0,0,1,0,0,0,1],
            [0,0,0,1,0,0,0],
            [0,0,0,0,1,0,0],
            [0,0,0,0,0,1,0],
            [0,0,0,0,0,0,1]
        ])

        # Measurement matrix
        self.kf.H = np.array([
            [1,0,0,0,0,0,0],
            [0,1,0,0,0,0,0],
            [0,0,1,0,0,0,0],
            [0,0,0,1,0,0,0]
        ])

        # Noise levels
        self.kf.R *= 0.01    # measurement noise
        self.kf.P *= 10.0    # covariance
        self.kf.Q *= 0.01    # process noise

        # Initialize state
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        s = (bbox[2]-bbox[0]) * (bbox[3]-bbox[1])
        r = (bbox[2]-bbox[0]) / (bbox[3]-bbox[1] + 1e-6)

        self.kf.x[:4] = np.array([[cx], [cy], [s], [r]])

        # Track metadata
        self.time_since_update = 0
        self.hits = 1
        self.hit_streak = 1
        self.id = TrackBox.count
        TrackBox.count += 1

    def update(self, bbox):
        """Update with new detection"""
        self.time_since_update = 0
        self.hits += 1
        self.hit_streak += 1

        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        s = (bbox[2]-bbox[0]) * (bbox[3]-bbox[1])
        r = (bbox[2]-bbox[0]) / (bbox[3]-bbox[1] + 1e-6)

        self.kf.update(np.array([cx, cy, s, r]).reshape(4,1))

    def predict(self):
        """Predict next state"""
        self.kf.predict()
        self.time_since_update += 1
        return self.get_state()

    def get_state(self):
        """Convert state back to bounding box"""
        cx, cy, s, r = self.kf.x[:4].reshape((4,))
        w = np.sqrt(abs(s * r))
        h = abs(s / (w + 1e-6))

        x1 = cx - w/2
        y1 = cy - h/2
        x2 = cx + w/2
        y2 = cy + h/2

        return np.array([x1, y1, x2, y2])


class Sort:
    """SORT enhanced for CCTV person/face tracking"""

    def __init__(self, max_age=10, min_hits=2, iou_threshold=0.2):
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        self.tracks = []

    def update(self, detections):
        """detections: Nx4 array"""

        # 1. Predict all tracks forward
        predicted_states = []
        for t in self.tracks:
            predicted_states.append(t.predict())

        # 2. Associate detections with tracks (Hungarian)
        if len(predicted_states) > 0 and len(detections) > 0:
            iou_matrix = np.zeros((len(predicted_states), len(detections)), dtype=np.float32)

            for i, pred in enumerate(predicted_states):
                for j, det in enumerate(detections):
                    iou_matrix[i, j] = iou(pred, det)

            row_idx, col_idx = linear_sum_assignment(-iou_matrix)

            assigned = set()
            used_dets = set()

            for r, c in zip(row_idx, col_idx):
                if iou_matrix[r, c] < self.iou_threshold:
                    continue
                self.tracks[r].update(detections[c])
                assigned.add(r)
                used_dets.add(c)

            # 3. Unassigned tracks
            for i, t in enumerate(self.tracks):
                if i not in assigned:
                    t.time_since_update += 1

            # 4. New tracks for detections not assigned
            for j, det in enumerate(detections):
                if j not in used_dets:
                    self.tracks.append(TrackBox(det))

        else:
            # all new tracks
            for det in detections:
                self.tracks.append(TrackBox(det))

        # 5. Remove dead tracks
        self.tracks = [t for t in self.tracks if t.time_since_update <= self.max_age]

        # 6. Output final states
        outputs = []
        for t in self.tracks:
            pred = t.get_state()
            if t.hits >= self.min_hits:
                outputs.append(np.append(pred, t.id))

        return np.array(outputs)
