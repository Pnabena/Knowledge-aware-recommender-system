"""Display data joined by real IDs; the verified recommender is left untouched."""
from functools import lru_cache
from pathlib import Path
import json
import math
import re
import unicodedata

import pandas as pd

from backend.recommender import (
    PROJECT_ROOT, bundle, business_metadata_by_id,
    _metadata_for_business, get_ranking_comparison,
)

PROCESSED_ROOT = PROJECT_ROOT / "Dataset_exploration" / "processed_data"
PHOTO_ROOT = (PROJECT_ROOT / "Dataset_exploration" / "Image_files" / "photos").resolve()
PHOTO_MANIFEST_PATH = PROCESSED_ROOT / "new_orleans_image_pipeline" / "new_orleans_image_embedding_manifest.parquet"
EMBEDDING_INDEX_PATH = PROCESSED_ROOT / "new_orleans_image_pipeline" / "clip_vit_b32_embeddings" / "new_orleans_clip_vit_b32_image_embedding_index.parquet"
PHOTO_ID = re.compile(r"^[A-Za-z0-9_-]{22}$")

business_index = bundle.business_index.merge(bundle.visual_availability, on="business_row", validate="one_to_one").set_index("business_id")
if len(business_index) != 2516 or set(business_index.index) != set(business_metadata_by_id.index):
    raise ValueError("Display catalogue must match the 2,516 frozen business IDs exactly")

manifest = pd.read_parquet(PHOTO_MANIFEST_PATH)
embedding_index = pd.read_parquet(EMBEDDING_INDEX_PATH)
# Require the original selection AND the completed embedding index, never an inferred match.
selected_manifest = manifest.loc[
    manifest["selected_for_embedding"] & manifest["in_personalisation_core"]
    & manifest["image_eligible"] & manifest["image_readable"]
].merge(embedding_index[["business_id", "photo_id"]], on=["business_id", "photo_id"], validate="one_to_one")
selected_manifest = selected_manifest.loc[selected_manifest.business_id.isin(business_index.index)].sort_values(["business_id", "selection_rank"], kind="stable")
if selected_manifest.groupby("business_id").size().max() > 5:
    raise ValueError("Unexpected image selection: more than the frozen cap of five")

_photos_by_business: dict[str, list[dict]] = {}
_photo_files: dict[str, str] = {}
for photo in selected_manifest.to_dict("records"):
    business_id, photo_id = photo["business_id"], photo["photo_id"]
    if not bool(business_index.loc[business_id, "has_visual_feature"]):
        continue
    filename = photo["photo_filename"]
    if not PHOTO_ID.fullmatch(photo_id) or Path(filename).name != filename or Path(filename).stem != photo_id or Path(filename).suffix.lower() not in {".jpg", ".jpeg"}:
        raise ValueError("Invalid filename in selected photo manifest")
    _photo_files[photo_id] = filename
    _photos_by_business.setdefault(business_id, []).append({
        "photo_id": photo_id, "business_id": business_id, "label": photo["label"],
        "selection_rank": int(photo["selection_rank"]),
        "width": int(photo["image_width"]), "height": int(photo["image_height"]),
        "image_url": f"/business-image/{photo_id}",
    })


def photo_path(photo_id: str) -> Path | None:
    """Allowlisted selected photos only; resolve symlinks before enforcing the root."""
    filename = _photo_files.get(photo_id) if PHOTO_ID.fullmatch(photo_id) else None
    if not filename:
        return None
    path = (PHOTO_ROOT / filename).resolve()
    return path if path.is_relative_to(PHOTO_ROOT) and path.is_file() else None


def business_photos(business_id: str) -> list[dict]:
    return [photo.copy() for photo in _photos_by_business.get(business_id, []) if photo_path(photo["photo_id"]) is not None]


def json_object(value) -> dict:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                return parsed
        except ValueError:
            pass
    return {}


def business_detail(business_id: str) -> dict | None:
    if business_id not in business_index.index:
        return None
    index = business_index.loc[business_id]
    record = business_metadata_by_id.loc[business_id]
    photos = business_photos(business_id)
    return {
        "source": "dataset", "business_id": business_id,
        "business_row": int(index["business_row"]),
        **_metadata_for_business(business_id),
        "has_visual_feature": bool(index["has_visual_feature"]),
        "attributes": json_object(record.get("attributes")), "hours": json_object(record.get("hours")),
        "image_url": photos[0]["image_url"] if photos else None, "photos": photos,
    }


@lru_cache(maxsize=32)
def frozen_comparison(user_row: int, k: int) -> dict:
    # The bundle is frozen. Cache its existing verified output, without altering scores/order.
    return get_ranking_comparison(user_row, k=k)


def feed_for_user(user_row: int, k: int) -> dict:
    comparison = frozen_comparison(user_row, k)
    counterparts = {item["business_id"]: item for item in comparison["comparison"]}
    businesses = []
    for item in comparison["mm"]:
        if not math.isfinite(item["score"]):
            continue  # Excluded training/validation items cannot become recommendations.
        business = business_detail(item["business_id"])
        if business is None:
            raise ValueError("Frozen rank has no matching catalogue business")
        ranks = counterparts[item["business_id"]]
        businesses.append({**business, "mm_rank": item["rank"], "mm_score": item["score"], "nv_rank": ranks["nv_rank"]})
    return {"source": "frozen-model", "model": "KGRec-MM", "user_row": user_row, "user_id": comparison["user_id"], "k": k, "businesses": businesses}


def enriched_comparison(user_row: int, k: int) -> dict:
    comparison = frozen_comparison(user_row, k)
    # Copy the response; do not mutate the cached verified ranks or underlying recommender.
    return {**comparison, "comparison": [{**item, "image_url": (photos[0]["image_url"] if (photos := business_photos(item["business_id"])) else None)} for item in comparison["comparison"]]}


def business_ranking(business_id: str, user_row: int) -> dict | None:
    comparison = frozen_comparison(user_row, len(business_index))
    item = next((row for row in comparison["comparison"] if row["business_id"] == business_id), None)
    if item is None or not all(math.isfinite(item[key]) for key in ("nv_score", "mm_score")):
        return None
    return {"user_row": user_row, "user_id": comparison["user_id"], **item}


def _search_text(value: str) -> str:
    return "".join(char for char in unicodedata.normalize("NFKD", value).casefold()
                   if char.isalnum() or char.isspace())


def search_businesses(query: str, user_row: int) -> dict:
    """Search every catalogue entry, preserving global ranks and exclusions."""
    comparison = frozen_comparison(user_row, len(business_index))
    tokens = _search_text(query).split()
    results = []
    for item in comparison["comparison"]:
        text = _search_text(" ".join([item["name"], *item["categories"], item["address"]]))
        if not tokens or not all(token in text for token in tokens):
            continue
        eligible = all(math.isfinite(item[key]) for key in ("nv_score", "mm_score"))
        photos = business_photos(item["business_id"])
        results.append({**item, "image_url": photos[0]["image_url"] if photos else None,
                        **({} if eligible else {key: None for key in ("nv_rank", "mm_rank", "nv_score", "mm_score", "rank_movement")})})
    return {"source": "frozen-model", "query": query, "user_row": user_row,
            "user_id": comparison["user_id"], "candidate_businesses": len(business_index),
            "total": len(results), "comparison": results}
