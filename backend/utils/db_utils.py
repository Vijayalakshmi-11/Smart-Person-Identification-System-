import numpy as np

def get_persons_from_db(supabase, limit=200):
    if not supabase:
        print("⚠️ Supabase not available.")
        return []

    res = supabase.table("missing_persons").select("*").limit(limit).execute()
    persons = res.data or []

    for p in persons:
        if p.get("descriptor"):
            p["descriptor"] = np.array(p["descriptor"], dtype=np.float32)
        else:
            p["descriptor"] = None

    return persons


def match_embedding(query, persons, threshold=0.45):
    best_person = None
    best_score = -1

    for p in persons:
        emb = p.get("descriptor")
        if emb is None:
            continue

        score = float(
            np.dot(query, emb) /
            (np.linalg.norm(query) * np.linalg.norm(emb))
        )

        if score > best_score:
            best_score = score
            best_person = p

    if best_score < threshold:
        return None, best_score

    return best_person, best_score


def save_sighting_if_new(
    supabase,
    person_id,
    confidence,
    bbox=None,
    location="Live Camera"
):
    import time
    from datetime import datetime
    from utils.shared import LAST_SIGHTING_TIME, SIGHTING_COOLDOWN

    now = time.time()
    last = LAST_SIGHTING_TIME.get(person_id, 0)

    if now - last < SIGHTING_COOLDOWN:
        return

    LAST_SIGHTING_TIME[person_id] = now

    supabase.table("sightings").insert({
    "missing_person_id": person_id,
    "confidence_score": float(confidence),
    "bbox": [int(x) for x in bbox] if bbox else None,
    "location": location,
    "status": "confirmed"
}).execute()
