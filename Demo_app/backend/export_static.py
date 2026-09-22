"""Export the frozen demo once; no Python or API is needed to serve the result.

Run from Demo_app: python -m backend.export_static
"""
import hashlib
import json
import math
from pathlib import Path
import shutil
import tempfile

from backend.catalogue import (
    business_detail, business_index, business_ranking, feed_for_user,
    frozen_comparison, photo_path, _search_text,
)
from backend.evidence import case_evidence, notebook_case_evidence, notebook_cases, review_excerpts

USER_ROW = 3279
APP_ROOT = Path(__file__).resolve().parents[1]


def static_urls(value):
    if isinstance(value, dict):
        return {key: static_urls(item) for key, item in value.items()}
    if isinstance(value, list):
        return [static_urls(item) for item in value]
    if isinstance(value, str) and value.startswith("/business-image/"):
        return f"/photos/{value.rsplit('/', 1)[1]}.jpg"
    return value


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(static_urls(value), ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n")


def export():
    public = APP_ROOT / "public"
    # Build a complete snapshot before replacing the previous one.
    with tempfile.TemporaryDirectory(prefix="static-export-", dir=APP_ROOT) as temporary:
        stage = Path(temporary)
        data = stage / "data"
        photos = stage / "photos"
        photos.mkdir()
        cases = notebook_cases()
        case_ids = {case["business_id"] for case in cases}
        comparison = frozen_comparison(USER_ROW, len(business_index))
        rows = {row["business_id"]: row for row in comparison["comparison"]}
        search = []
        copied = set()
        for number, business_id in enumerate(business_index.index, 1):
            detail = business_detail(business_id)
            detail["review_excerpts"] = review_excerpts(business_id)
            ranked = rows[business_id]
            eligible = all(math.isfinite(ranked[key]) for key in ("nv_score", "mm_score"))
            search.append({
                **ranked, "image_url": detail["image_url"],
                "search_text": _search_text(" ".join([detail["name"], *detail["categories"], detail["address"]])),
                **({} if eligible else {key: None for key in ("nv_rank", "mm_rank", "nv_score", "mm_score", "rank_movement")}),
            })
            write_json(data / "businesses" / f"{business_id}.json", {
                "business": detail,
                "ranking": business_ranking(business_id, USER_ROW),
                "evidence": case_evidence(business_id, USER_ROW),
                "notebook_case": notebook_case_evidence(business_id) if business_id in case_ids else None,
            })
            for photo in detail["photos"]:
                photo_id = photo["photo_id"]
                if photo_id not in copied:
                    shutil.copyfile(photo_path(photo_id), photos / f"{photo_id}.jpg")
                    copied.add(photo_id)
            if number % 250 == 0:
                print(f"Exported {number}/{len(business_index)} businesses", flush=True)
        write_json(data / "feed.json", feed_for_user(USER_ROW, 30))
        write_json(data / "notebook-cases.json", cases)
        write_json(data / "catalogue.json", {
            "source": "frozen-model", "user_row": USER_ROW, "user_id": comparison["user_id"],
            "candidate_businesses": len(business_index), "total": len(search), "comparison": search,
        })
        files = {
            str(path.relative_to(stage)): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(stage.rglob("*")) if path.is_file()
        }
        write_json(data / "manifest.json", {
            "schema_version": 1, "user_row": USER_ROW, "businesses": len(search),
            "notebook_cases": len(cases), "photos": len(copied),
            "recommender_sha256": hashlib.sha256((APP_ROOT / "backend/recommender.py").read_bytes()).hexdigest(),
            "sha256": files,
        })
        for folder in ("data", "photos"):
            target = public / folder
            if target.exists():
                shutil.rmtree(target)
            shutil.move(str(stage / folder), target)
        print(f"Static snapshot ready: {len(search)} businesses, {len(cases)} cases, {len(copied)} photos.", flush=True)


if __name__ == "__main__":
    export()
