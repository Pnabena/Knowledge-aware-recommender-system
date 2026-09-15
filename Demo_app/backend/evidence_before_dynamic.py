"""Read the exported dissertation cases, scoped to the exact experimental user."""
import math
import pandas as pd

from backend.catalogue import PROCESSED_ROOT, business_photos, frozen_comparison

EVIDENCE_ROOT = PROCESSED_ROOT / "new_orleans_model_outputs" / "explanations"


def table(name: str) -> pd.DataFrame:
    path = EVIDENCE_ROOT / name

    if not path.is_file():
        raise FileNotFoundError(f"Evidence file not found: {path}")

    if path.suffix == ".parquet":
        return pd.read_parquet(path)

    return pd.read_csv(path)


# Existing K5 case-study evidence
summaries = table("k5_case_behaviour_summary.csv")
overlaps = table("k5_case_user_category_overlap.csv")
history = table("k5_case_matching_training_businesses.csv")
texts = table("k5_case_text_evidence.csv")
visuals = table("k5_case_visual_evidence.csv")


# Full K4 evidence
structured_evidence = table(
    "k4_structured_business_evidence.parquet"
)

review_evidence = table(
    "k4_review_text_representativeness.parquet"
)

visual_evidence = table(
    "k4_visual_image_representativeness.parquet"
)

visual_strength = table(
    "k4_business_visual_evidence_strength.parquet"
)

unified_coverage = table(
    "k4_unified_business_evidence_coverage.parquet"
)


def matching(frame: pd.DataFrame, **values) -> list[dict]:
    if frame.empty or any(key not in frame for key in values):
        return []
    selected = frame
    for key, value in values.items():
        selected = selected.loc[selected[key] == value]
    # Strict JSON: absent numerical evidence stays null, never NaN or a made-up zero.
    return [{key: (None if isinstance(value, float) and not math.isfinite(value) else value) for key, value in row.items()} for row in selected.to_dict("records")]


def review_excerpts(business_id: str) -> list[dict]:
    return matching(texts, business_id=business_id)[:3]


def case_evidence(business_id: str, user_row: int) -> dict | None:
    cases = matching(summaries, business_id=business_id, user_row=user_row)
    if not cases:
        return None
    case = cases[0]
    comparison = frozen_comparison(user_row, 30)
    result = next((row for row in comparison["comparison"] if row["business_id"] == business_id), None)
    if result is None or comparison["user_id"] != case["user_id"] or (result["nv_rank"], result["mm_rank"]) != (case["nv_rank"], case["mm_rank"]):
        return None
    photos = {photo["photo_id"]: photo for photo in business_photos(business_id)}
    selected_visuals = [{**row, "image_url": photos[row["photo_id"]]["image_url"]} for row in matching(visuals, business_id=business_id) if row["photo_id"] in photos]
    return {
        "source": "frozen-model", "summary": case,
        "category_overlap": matching(overlaps, business_id=business_id, user_id=case["user_id"]),
        "history": matching(history, target_business_id=business_id, user_id=case["user_id"]),
        "text": review_excerpts(business_id), "visual": selected_visuals,
    }
