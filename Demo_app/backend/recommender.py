from pathlib import Path
import json

import numpy as np
import pandas as pd


# --------------------------------------------------
# Project paths
# --------------------------------------------------

DEMO_APP_ROOT = Path(__file__).resolve().parents[1]

PROJECT_ROOT = DEMO_APP_ROOT.parent

BUNDLE_DIR = (
    PROJECT_ROOT
    /
    "Dataset_exploration"
    /
    "processed_data"
    /
    "new_orleans_demo"
    /
    "live_inference"
)


class FrozenRecommenderBundle:

    def __init__(self):

        if not BUNDLE_DIR.exists():
            raise FileNotFoundError(
                f"Live inference bundle not found: {BUNDLE_DIR}"
            )

        # ------------------------------------------
        # Frozen representation matrices
        # mmap_mode='r' avoids unnecessary copies
        # ------------------------------------------

        self.nv_user_repr = np.load(
            BUNDLE_DIR
            /
            "nv_user_representations.npy",
            mmap_mode="r"
        )

        self.nv_business_repr = np.load(
            BUNDLE_DIR
            /
            "nv_business_representations.npy",
            mmap_mode="r"
        )

        self.mm_user_repr = np.load(
            BUNDLE_DIR
            /
            "mm_user_representations.npy",
            mmap_mode="r"
        )

        self.mm_business_repr = np.load(
            BUNDLE_DIR
            /
            "mm_business_representations.npy",
            mmap_mode="r"
        )

        # ------------------------------------------
        # Index / experiment metadata
        # ------------------------------------------

        self.user_index = pd.read_parquet(
            BUNDLE_DIR
            /
            "user_index.parquet"
        )

        self.business_index = pd.read_parquet(
            BUNDLE_DIR
            /
            "business_index.parquet"
        )

        self.test_exclusions = pd.read_parquet(
            BUNDLE_DIR
            /
            "test_exclusions.parquet"
        )

        self.test_targets = pd.read_parquet(
            BUNDLE_DIR
            /
            "test_targets.parquet"
        )

        self.visual_availability = pd.read_parquet(
            BUNDLE_DIR
            /
            "business_visual_availability.parquet"
        )

        with open(
            BUNDLE_DIR
            /
            "manifest.json",
            "r"
        ) as file:

            self.manifest = json.load(
                file
            )

        self._validate()


    def _validate(self):

        assert (
            self.nv_user_repr.shape[0]
            ==
            14991
        )

        assert (
            self.mm_user_repr.shape[0]
            ==
            14991
        )

        assert (
            self.nv_business_repr.shape[0]
            ==
            2516
        )

        assert (
            self.mm_business_repr.shape[0]
            ==
            2516
        )

        assert (
            len(
                self.user_index
            )
            ==
            14991
        )

        assert (
            len(
                self.business_index
            )
            ==
            2516
        )


    def status(self):

        return {

            "bundle_loaded":
                True,

            "bundle_path":
                str(
                    BUNDLE_DIR
                ),

            "users":
                int(
                    self.nv_user_repr.shape[0]
                ),

            "businesses":
                int(
                    self.nv_business_repr.shape[0]
                ),

            "nv_shape":
                list(
                    self.nv_user_repr.shape
                ),

            "mm_shape":
                list(
                    self.mm_user_repr.shape
                ),

            "visual_businesses":
                int(
                    self.visual_availability[
                        "has_visual_feature"
                    ].sum()
                ),

            "image_less_businesses":
                int(
                    (
                        ~self.visual_availability[
                            "has_visual_feature"
                        ]
                    ).sum()
                ),

            "source":
                self.manifest.get(
                    "source"
                ),

            "retraining":
                self.manifest.get(
                    "retraining"
                )
        }


bundle = FrozenRecommenderBundle()


# --------------------------------------------------
# Live frozen-model ranking
# --------------------------------------------------

def _rank_model(
    user_row,
    user_representations,
    business_representations
):
    if user_row < 0 or user_row >= len(user_representations):
        raise ValueError(
            f"user_row must be between 0 and "
            f"{len(user_representations) - 1}"
        )

    user_vector = np.asarray(
        user_representations[user_row],
        dtype=np.float32
    )

    scores = (
        np.asarray(
            business_representations,
            dtype=np.float32
        )
        @
        user_vector
    )

    scores = scores.copy()

    excluded_rows = (
        bundle.test_exclusions.loc[
            bundle.test_exclusions["user_row"] == user_row,
            "business_row"
        ]
        .to_numpy(dtype=np.int64)
    )

    scores[excluded_rows] = -np.inf

    business_rows = np.arange(
        len(scores),
        dtype=np.int64
    )

    ranked_rows = np.lexsort(
        (
            business_rows,
            -scores
        )
    )

    return scores, ranked_rows


def _business_result(
    business_row,
    rank,
    score
):
    business_record = (
        bundle.business_index
        .iloc[int(business_row)]
    )

    visual_record = (
        bundle.visual_availability
        .iloc[int(business_row)]
    )

    return {
        "business_row": int(business_row),

        "business_id": str(
            business_record["business_id"]
        ),

        "rank": int(rank),

        "score": float(score),

        "has_visual_feature": bool(
            visual_record["has_visual_feature"]
        )
    }


def get_ranking_comparison(
    user_row,
    k=20
):
    user_row = int(user_row)
    k = int(k)

    if k < 1:
        raise ValueError(
            "k must be at least 1."
        )

    k = min(
        k,
        bundle.nv_business_repr.shape[0]
    )

    # ------------------------------------------
    # Non-visual ranking
    # ------------------------------------------

    nv_scores, nv_ranked_rows = _rank_model(
        user_row=user_row,
        user_representations=bundle.nv_user_repr,
        business_representations=bundle.nv_business_repr
    )

    # ------------------------------------------
    # Multimodal ranking
    # ------------------------------------------

    mm_scores, mm_ranked_rows = _rank_model(
        user_row=user_row,
        user_representations=bundle.mm_user_repr,
        business_representations=bundle.mm_business_repr
    )

    # ------------------------------------------
    # Top-K results
    # ------------------------------------------

    nv_top = [
        _business_result(
            business_row=business_row,
            rank=rank,
            score=nv_scores[business_row]
        )
        for rank, business_row
        in enumerate(
            nv_ranked_rows[:k],
            start=1
        )
    ]

    mm_top = [
        _business_result(
            business_row=business_row,
            rank=rank,
            score=mm_scores[business_row]
        )
        for rank, business_row
        in enumerate(
            mm_ranked_rows[:k],
            start=1
        )
    ]

    # ------------------------------------------
    # Held-out target
    # ------------------------------------------

    target_row = int(
        bundle.test_targets.loc[
            bundle.test_targets["user_row"] == user_row,
            "test_business_row"
        ]
        .iloc[0]
    )

    nv_target_rank = int(
        np.flatnonzero(
            nv_ranked_rows == target_row
        )[0]
        + 1
    )

    mm_target_rank = int(
        np.flatnonzero(
            mm_ranked_rows == target_row
        )[0]
        + 1
    )

    target_business = (
        bundle.business_index
        .iloc[target_row]
    )

    user_record = (
        bundle.user_index
        .iloc[user_row]
    )

    return {
        "source": "frozen-model",

        "user_row": user_row,

        "user_id": str(
            user_record["user_id"]
        ),

        "candidate_businesses": int(
            bundle.nv_business_repr.shape[0]
        ),

        "k": k,

        "held_out_target": {
            "business_row": target_row,

            "business_id": str(
                target_business["business_id"]
            ),

            "nv_rank": nv_target_rank,

            "mm_rank": mm_target_rank,

            "rank_movement":
                nv_target_rank
                -
                mm_target_rank
        },

        "nv": nv_top,

        "mm": mm_top
    }


# ==================================================
# Real Yelp business display metadata
# ==================================================

BUSINESS_METADATA_PATH = (
    PROJECT_ROOT
    /
    "Dataset_exploration"
    /
    "processed_data"
    /
    "new_orleans_subset"
    /
    "new_orleans_personalisation_businesses.parquet"
)


if not BUSINESS_METADATA_PATH.exists():
    raise FileNotFoundError(
        f"Business metadata not found: {BUSINESS_METADATA_PATH}"
    )


business_catalogue = pd.read_parquet(
    BUSINESS_METADATA_PATH
).copy()


business_catalogue["business_id"] = (
    business_catalogue["business_id"]
    .astype(str)
)


business_metadata_by_id = (
    business_catalogue
    .set_index(
        "business_id",
        drop=False
    )
)


def _parse_categories(record):

    raw_category_list = record.get(
        "category_list"
    )

    if isinstance(
        raw_category_list,
        str
    ):
        try:
            parsed = json.loads(
                raw_category_list
            )

            if isinstance(
                parsed,
                list
            ):
                return [
                    str(value)
                    for value in parsed
                ]

        except Exception:
            pass


    raw_categories = record.get(
        "categories"
    )

    if isinstance(
        raw_categories,
        str
    ):
        return [
            value.strip()
            for value
            in raw_categories.split(",")
            if value.strip()
        ]


    return []


def _metadata_for_business(
    business_id
):

    if (
        business_id
        not in
        business_metadata_by_id.index
    ):
        return {
            "name": None,
            "address": None,
            "city": None,
            "state": None,
            "postal_code": None,
            "stars": None,
            "review_count": None,
            "categories": [],
            "is_open": None
        }


    record = (
        business_metadata_by_id
        .loc[
            business_id
        ]
    )


    return {

        "name":
            str(
                record["name"]
            ),

        "address":
            str(
                record["address"]
            ),

        "city":
            str(
                record["city"]
            ),

        "state":
            str(
                record["state"]
            ),

        "postal_code":
            str(
                record["postal_code"]
            ),

        "stars":
            float(
                record["stars"]
            ),

        "review_count":
            int(
                record["review_count"]
            ),

        "categories":
            _parse_categories(
                record
            ),

        "is_open":
            bool(
                record["is_open"]
            )
    }


# --------------------------------------------------
# Replace the minimal ranking display object
# with a real Yelp-backed display object.
# --------------------------------------------------

def _business_result(
    business_row,
    rank,
    score
):

    business_record = (
        bundle.business_index
        .iloc[
            int(
                business_row
            )
        ]
    )


    business_id = str(
        business_record[
            "business_id"
        ]
    )


    visual_record = (
        bundle.visual_availability
        .iloc[
            int(
                business_row
            )
        ]
    )


    result = {

        "business_row":
            int(
                business_row
            ),

        "business_id":
            business_id,

        "rank":
            int(
                rank
            ),

        "score":
            float(
                score
            ),

        "has_visual_feature":
            bool(
                visual_record[
                    "has_visual_feature"
                ]
            )
    }


    result.update(
        _metadata_for_business(
            business_id
        )
    )


    return result


# --------------------------------------------------
# Preserve the verified ranking implementation,
# then enrich its held-out target metadata.
# --------------------------------------------------

_base_get_ranking_comparison = (
    get_ranking_comparison
)


def get_ranking_comparison(
    user_row,
    k=20
):

    response = (
        _base_get_ranking_comparison(
            user_row=
                user_row,

            k=
                k
        )
    )


    target_business_id = (
        response[
            "held_out_target"
        ][
            "business_id"
        ]
    )


    response[
        "held_out_target"
    ].update(
        _metadata_for_business(
            target_business_id
        )
    )


    return response


# ==================================================
# Cross-model comparison enrichment
# ==================================================

_metadata_get_ranking_comparison = get_ranking_comparison


def get_ranking_comparison(
    user_row,
    k=20
):

    response = (
        _metadata_get_ranking_comparison(
            user_row=user_row,
            k=k
        )
    )


    # Reproduce both complete frozen rankings so
    # every displayed business has exact NV + MM rank.
    nv_scores, nv_ranked_rows = _rank_model(
        user_row=int(user_row),
        user_representations=bundle.nv_user_repr,
        business_representations=bundle.nv_business_repr
    )


    mm_scores, mm_ranked_rows = _rank_model(
        user_row=int(user_row),
        user_representations=bundle.mm_user_repr,
        business_representations=bundle.mm_business_repr
    )


    # --------------------------------------------------
    # Rank lookup:
    # lookup[business_row] -> exact 1-based rank
    # --------------------------------------------------

    nv_rank_lookup = np.empty(
        len(nv_ranked_rows),
        dtype=np.int64
    )

    nv_rank_lookup[
        nv_ranked_rows
    ] = np.arange(
        1,
        len(nv_ranked_rows) + 1,
        dtype=np.int64
    )


    mm_rank_lookup = np.empty(
        len(mm_ranked_rows),
        dtype=np.int64
    )

    mm_rank_lookup[
        mm_ranked_rows
    ] = np.arange(
        1,
        len(mm_ranked_rows) + 1,
        dtype=np.int64
    )


    # --------------------------------------------------
    # Union of businesses appearing in either Top-K
    # --------------------------------------------------

    union_rows = []

    seen = set()


    for item in (
        response["mm"]
        +
        response["nv"]
    ):

        business_row = int(
            item["business_row"]
        )

        if business_row not in seen:

            seen.add(
                business_row
            )

            union_rows.append(
                business_row
            )


    comparison = []


    for business_row in union_rows:

        business_id = str(
            bundle.business_index
            .iloc[
                business_row
            ][
                "business_id"
            ]
        )


        visual_record = (
            bundle.visual_availability
            .iloc[
                business_row
            ]
        )


        item = {

            "business_row":
                business_row,

            "business_id":
                business_id,

            "nv_rank":
                int(
                    nv_rank_lookup[
                        business_row
                    ]
                ),

            "mm_rank":
                int(
                    mm_rank_lookup[
                        business_row
                    ]
                ),

            "nv_score":
                float(
                    nv_scores[
                        business_row
                    ]
                ),

            "mm_score":
                float(
                    mm_scores[
                        business_row
                    ]
                ),

            "rank_movement":
                int(
                    nv_rank_lookup[
                        business_row
                    ]
                    -
                    mm_rank_lookup[
                        business_row
                    ]
                ),

            "has_visual_feature":
                bool(
                    visual_record[
                        "has_visual_feature"
                    ]
                )
        }


        item.update(
            _metadata_for_business(
                business_id
            )
        )


        comparison.append(
            item
        )


    response[
        "comparison"
    ] = comparison


    return response
