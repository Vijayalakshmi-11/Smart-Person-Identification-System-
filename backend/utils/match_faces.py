import numpy as np
from numpy.linalg import norm

DEBUG = False

class FaceMatcher:
    def __init__(self, sim_threshold=0.35):
        self.sim_threshold = sim_threshold

    def cosine_similarity(self, v1, v2):
        return np.dot(v1, v2) / (norm(v1) * norm(v2))

    def match(self, known_embeddings, target_embedding):
        if target_embedding is None:
            return None, 0.0

        best_score = -1.0
        best_name = None

        for name, emb in known_embeddings.items():
            if emb is None:
                continue

            score = self.cosine_similarity(emb, target_embedding)

            if score > best_score:
                best_score = score
                best_name = name

        if best_score >= self.sim_threshold:
            return best_name, best_score
        else:
            return "UNKNOWN", best_score
