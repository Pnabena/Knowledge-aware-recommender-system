"""Integration checks against the actual local frozen bundle and photo manifest."""
import hashlib
import json
import math
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app
from backend import catalogue, evidence as evidence_layer
from backend.recommender import business_metadata_by_id, get_ranking_comparison

client = TestClient(app)
HERBSAINT = "ZTctPm8-lBy0iJ9dFhYhyQ"


class DatasetIntegrationTests(unittest.TestCase):
    def test_verified_model_is_unchanged(self):
        digest = hashlib.sha256(Path(__file__).with_name("recommender.py").read_bytes()).hexdigest()
        self.assertEqual(digest, "1bdb1831dc6e6c8b6d28a3ac8d76d25c7e55a7b3c8c87dab80b7e46b90e45487")
        self.assertEqual(client.get("/health").json()["status"], "ok")
        status = client.get("/model-status").json()
        for key, value in {"users": 14991, "businesses": 2516, "visual_businesses": 1729, "image_less_businesses": 787, "retraining": False}.items():
            self.assertEqual(status[key], value)
        response = client.get("/rankings/3279?k=20").json()
        target = response["held_out_target"]
        self.assertEqual((target["business_id"], target["nv_rank"], target["mm_rank"], target["rank_movement"]), (HERBSAINT, 44, 6, 38))
        original = get_ranking_comparison(3279, 20)
        for actual, expected in zip(response["comparison"], original["comparison"], strict=True):
            self.assertEqual({key: actual[key] for key in expected}, expected)

    def test_feed_preserves_verified_mm_order_and_metadata(self):
        response = client.get("/feed/3279?k=30")
        self.assertEqual(response.status_code, 200)
        feed = response.json()
        self.assertEqual(feed["source"], "frozen-model")
        expected = get_ranking_comparison(3279, 30)["mm"]
        self.assertEqual([row["business_id"] for row in feed["businesses"]], [row["business_id"] for row in expected])
        for actual, ranked in zip(feed["businesses"], expected, strict=True):
            metadata = business_metadata_by_id.loc[actual["business_id"]]
            self.assertEqual(actual["mm_rank"], ranked["rank"])
            self.assertEqual(actual["mm_score"], ranked["score"])
            for key in ["name", "stars", "review_count", "address", "city", "state"]:
                self.assertEqual(actual[key], metadata[key])
            self.assertEqual(actual["categories"], json.loads(metadata.category_list))
            profile = client.get(f'/businesses/{actual["business_id"]}').json()
            for key in ["business_id", "name", "stars", "categories", "photos"]:
                self.assertEqual(profile[key], actual[key])

    def test_entire_catalogue_photo_ownership_and_mask(self):
        manifest = pd.read_parquet(catalogue.PHOTO_MANIFEST_PATH).set_index("photo_id")
        masked = 0
        for business_id in catalogue.business_index.index:
            detail = catalogue.business_detail(business_id)
            self.assertLessEqual(len(detail["photos"]), 5)
            if not detail["has_visual_feature"]:
                masked += 1
                self.assertIsNone(detail["image_url"])
                self.assertEqual(detail["photos"], [])
            for photo in detail["photos"]:
                record = manifest.loc[photo["photo_id"]]
                self.assertEqual(record.business_id, business_id)
                self.assertTrue(record.selected_for_embedding)
                self.assertEqual(record.selection_rank, photo["selection_rank"])
                self.assertTrue(catalogue.photo_path(photo["photo_id"]).is_relative_to(catalogue.PHOTO_ROOT))
        self.assertEqual(masked, 787)

    def test_image_endpoint_is_allowlisted_and_serves_exact_bytes(self):
        photo = catalogue.business_photos(HERBSAINT)[0]
        self.assertEqual(photo["photo_id"], "Sy4raAjYQcwxiOWOz9erRg")
        response = client.get(photo["image_url"])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "image/jpeg")
        self.assertEqual(response.content, catalogue.photo_path(photo["photo_id"]).read_bytes())
        self.assertEqual(client.get("/business-image/not-a-selected-photo").status_code, 404)
        self.assertIsNone(catalogue.photo_path("../../backend/main.py"))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "photos"
            root.mkdir()
            outside = Path(directory) / "private.jpg"
            outside.write_bytes(b"private")
            (root / "selected.jpg").symlink_to(outside)
            with patch.object(catalogue, "PHOTO_ROOT", root), patch.dict(catalogue._photo_files, {photo["photo_id"]: "selected.jpg"}):
                self.assertIsNone(catalogue.photo_path(photo["photo_id"]))

    def test_k4_evidence_includes_full_history_and_representative_content(self):
        evidence = client.get(f"/businesses/{HERBSAINT}/explanation?user_row=3279").json()
        self.assertEqual((evidence["summary"]["nv_rank"], evidence["summary"]["mm_rank"]), (44, 6))
        self.assertEqual(tuple(len(evidence[key]) for key in ["history", "text", "visual"]), (10, 3, 5))
        self.assertEqual(evidence["summary"]["user_id"], "D76EFdD5F7XoIIyQmWTQhA")
        interactions = evidence_layer.review_evidence
        genuine_history = set(interactions.loc[interactions.user_id == evidence["summary"]["user_id"], "business_id"]) - {HERBSAINT}
        self.assertEqual({row["business_id"] for row in evidence["history"]}, genuine_history)
        self.assertEqual({row["name"] for row in evidence["history"] if row["shared_category_count"] == 0}, {"B Mac's", "Starbucks"})
        self.assertEqual(evidence["history"], sorted(evidence["history"], key=lambda row: (-row["shared_category_count"], row["name"])))
        self.assertEqual([(row["label"], round(row["visual_representativeness"], 6)) for row in evidence["visual"]], [
            ("inside", 0.902639), ("outside", 0.890020), ("inside", 0.838609), ("food", 0.836360), ("drink", 0.826757),
        ])
        self.assertAlmostEqual(evidence["summary"]["target_visual_score_gain"], 0.9309106469154358)
        self.assertEqual(evidence["summary"]["target_visual_rank_gain"], 762)

    def test_ordinary_recommendations_receive_k4_without_k5_diagnostics(self):
        acme = client.get("/feed/3279?k=1").json()["businesses"][0]["business_id"]
        for business_id, user_row in [(acme, 3279), (HERBSAINT, 0)]:
            with self.subTest(business_id=business_id, user_row=user_row):
                evidence = client.get(f"/businesses/{business_id}/explanation?user_row={user_row}").json()
                self.assertIsNotNone(evidence)
                self.assertEqual(evidence["summary"]["user_row"], user_row)
                for field in ["target_visual_score_gain", "target_visual_rank_gain", "competitive_visual_rank_effect"]:
                    self.assertIsNone(evidence["summary"][field])
        self.assertIsNone(evidence_layer.case_evidence("not-a-real-business", 3279))

    def test_k5_only_enriches_diagnostics_for_matching_identity_and_ranks(self):
        base = evidence_layer.dynamic_evidence(HERBSAINT, 3279)
        enriched = evidence_layer.case_evidence(HERBSAINT, 3279)
        diagnostic_fields = {"target_visual_score_gain", "target_visual_rank_gain", "competitive_visual_rank_effect"}
        for key in base:
            if key != "summary":
                self.assertEqual(enriched[key], base[key])
        self.assertEqual({key: value for key, value in enriched["summary"].items() if key not in diagnostic_fields},
                         {key: value for key, value in base["summary"].items() if key not in diagnostic_fields})
        for field, value in [("user_id", "different-user"), ("nv_rank", 999), ("mm_rank", 999)]:
            with self.subTest(field=field):
                cases = evidence_layer.summaries.copy()
                cases.loc[(cases.business_id == HERBSAINT) & (cases.user_row == 3279), field] = value
                with patch.object(evidence_layer, "summaries", cases):
                    self.assertEqual(evidence_layer.case_evidence(HERBSAINT, 3279), base)

    def test_invalid_inputs_are_explicit(self):
        for path in ["/feed/-1", "/feed/14991", "/feed/3279?k=0", "/feed/3279?k=101", "/rankings/-1"]:
            self.assertEqual(client.get(path).status_code, 422, path)
        self.assertEqual(client.get("/businesses/not-a-real-business").status_code, 404)

    def test_notebook_cases_use_the_exact_exported_user_and_evidence(self):
        cases = client.get("/notebook-cases").json()
        self.assertEqual(len(cases), 5)
        for case in cases:
            with self.subTest(case=case["case_type"]):
                payload = client.get(f'/businesses/{case["business_id"]}/notebook-case').json()
                self.assertEqual(payload["summary"], case)
                self.assertEqual(len(payload["category_overlap"]), case["target_category_count"])
                self.assertEqual(sum(row["historical_business_count"] > 0 for row in payload["category_overlap"]), case["target_categories_supported_by_history"])
                ranking = client.get(f'/businesses/{case["business_id"]}/ranking?user_row={case["user_row"]}').json()
                for key in ("user_id", "user_row", "nv_rank", "mm_rank"):
                    self.assertEqual(ranking[key], case[key])
        ruby = "oBNrLz4EDhiscSlbOl8uAw"
        case = client.get(f"/businesses/{ruby}/notebook-case").json()
        demo = client.get(f"/businesses/{ruby}/explanation?user_row=3279").json()
        self.assertEqual((case["summary"]["nv_rank"], case["summary"]["mm_rank"], case["summary"]["target_category_support_fraction"]), (52, 13, 0.6))
        self.assertEqual(case["history"][0]["name"], "Russell's Marina Grill")
        self.assertEqual(case["summary"]["target_visual_rank_gain"], 713)
        self.assertEqual((demo["summary"]["nv_rank"], demo["summary"]["mm_rank"]), (64, 20))
        self.assertEqual(demo["history"][0]["name"], "Commander's Palace")
        self.assertIsNone(demo["summary"]["target_visual_rank_gain"])
        self.assertIsNone(client.get("/businesses/not-a-real-business/notebook-case").json())
        altered = evidence_layer.summaries.copy()
        altered.loc[altered.business_id == ruby, "mm_rank"] = 999
        with patch.object(evidence_layer, "summaries", altered), self.assertRaises(ValueError):
            evidence_layer.notebook_case_evidence(ruby)

    def test_search_matches_catalogue_and_preserves_global_ranks(self):
        for query in ("emeril", "EMERIL", "Emeril’s", "Emeril's"):
            response = client.get("/search", params={"q": query}).json()
            ids = {row["business_id"] for row in response["comparison"]}
            self.assertIn("u7uFQCoHFtBKCtbWUm6yZw", ids)
            self.assertNotIn(HERBSAINT, ids)
            for row in response["comparison"]:
                ranking = catalogue.business_ranking(row["business_id"], 3279)
                self.assertEqual((row["nv_rank"], row["mm_rank"]), (ranking["nv_rank"], ranking["mm_rank"]))
        self.assertEqual(client.get("/search", params={"q": "no-such-business-zzzzz"}).json()["comparison"], [])
        self.assertEqual(client.get("/search", params={"q": "!!!"}).json()["comparison"], [])
        excluded = next(row for row in catalogue.frozen_comparison(3279, 2516)["comparison"] if not math.isfinite(row["mm_score"]))
        found = client.get("/search", params={"q": excluded["name"]}).json()
        item = next(row for row in found["comparison"] if row["business_id"] == excluded["business_id"])
        self.assertIsNone(item["mm_rank"])
        self.assertIsNone(item["mm_score"])
        self.assertIsNone(client.get(f'/businesses/{item["business_id"]}/ranking').json())
        self.assertIsNone(client.get(f'/businesses/{item["business_id"]}/explanation').json())
        for params in ({"q": "emeril", "user_row": -1}, {"q": ""}, {"q": "a" * 201}):
            self.assertEqual(client.get("/search", params=params).status_code, 422)


if __name__ == "__main__":
    unittest.main()
