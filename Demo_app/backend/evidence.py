"""
Evidence layer for the dissertation demo.

Full frozen K4 artefacts provide recommendation evidence, including genuine
training history, category overlap, representative reviews and photos.
Exact K5 cases enrich only the three exported sensitivity diagnostics when
user identity and frozen ranks match. Ordinary businesses retain null diagnostics.
"""

import math
import pandas as pd

from backend.catalogue import (
    PROCESSED_ROOT,
    business_photos,
    business_ranking,
    frozen_comparison,
)


EVIDENCE_ROOT = (
    PROCESSED_ROOT
    /
    "new_orleans_model_outputs"
    /
    "explanations"
)


# ==================================================
# Loading helpers
# ==================================================

def table(name: str) -> pd.DataFrame:

    path = EVIDENCE_ROOT / name

    if not path.is_file():

        raise FileNotFoundError(
            f"Evidence file not found: {path}"
        )

    if path.suffix == ".parquet":

        return pd.read_parquet(
            path
        )

    return pd.read_csv(
        path
    )


# ==================================================
# Exact K5 case-study evidence
# ==================================================

summaries = table(
    "k5_case_behaviour_summary.csv"
)

overlaps = table(
    "k5_case_user_category_overlap.csv"
)

history = table(
    "k5_case_matching_training_businesses.csv"
)

texts = table(
    "k5_case_text_evidence.csv"
)

visuals = table(
    "k5_case_visual_evidence.csv"
)


def notebook_cases() -> list[dict]:
    return matching(summaries)


def notebook_case_evidence(business_id: str) -> dict | None:
    """Replay the exact selected K5 user/business case, never the demo user's history."""
    cases = matching(summaries, business_id=business_id)
    if not cases:
        return None
    case = cases[0]
    ranked = business_ranking(business_id, int(case["user_row"]))
    if ranked is None or any(ranked[key] != case[key] for key in ("user_id", "nv_rank", "mm_rank")):
        raise ValueError("Notebook case no longer matches the frozen ranking bundle")
    photos = {photo["photo_id"]: photo for photo in business_photos(business_id)}
    return {
        "source": "frozen-model", "summary": case,
        "category_overlap": matching(overlaps, business_id=business_id, user_id=case["user_id"]),
        "history": sorted(matching(history, target_business_id=business_id, user_id=case["user_id"]),
                          key=lambda row: (-row["shared_category_count"], row["name"])),
        "text": matching(texts, business_id=business_id),
        "visual": [{**row, "image_url": photos[row["photo_id"]]["image_url"]}
                   for row in matching(visuals, business_id=business_id) if row["photo_id"] in photos],
    }


# ==================================================
# Full K4 evidence
# ==================================================

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


# ==================================================
# JSON / dataframe helpers
# ==================================================

def _safe_value(value):

    try:

        if pd.isna(value):

            return None

    except Exception:

        pass


    if hasattr(
        value,
        "item"
    ):

        try:

            value = value.item()

        except Exception:

            pass


    if (
        not isinstance(
            value,
            str
        )
        and
        hasattr(
            value,
            "isoformat"
        )
    ):

        try:

            return value.isoformat()

        except Exception:

            pass


    if (
        isinstance(
            value,
            float
        )
        and
        not math.isfinite(
            value
        )
    ):

        return None


    return value


def matching(
    frame: pd.DataFrame,
    **values
) -> list[dict]:

    if (
        frame.empty
        or
        any(
            key not in frame
            for key in values
        )
    ):

        return []


    selected = frame


    for key, value in values.items():

        selected = (
            selected.loc[
                selected[key]
                ==
                value
            ]
        )


    return [
        {
            key:
                _safe_value(
                    value
                )

            for key, value
            in row.items()
        }

        for row
        in selected.to_dict(
            "records"
        )
    ]


def _parse_categories(
    value
) -> list[str]:

    if value is None:

        return []


    if isinstance(
        value,
        list
    ):

        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]


    if not isinstance(
        value,
        str
    ):

        return []


    return [
        item.strip()
        for item
        in value.split(",")
        if item.strip()
    ]


def _coverage_record(
    business_id: str
) -> dict | None:

    rows = matching(
        unified_coverage,
        business_id=business_id
    )

    if not rows:

        return None

    return rows[0]


# ==================================================
# Exact K5 text evidence
# ==================================================

def review_excerpts(
    business_id: str
) -> list[dict]:

    return matching(
        texts,
        business_id=business_id
    )[:3]


# ==================================================
# Dynamic text evidence
# ==================================================

def dynamic_text_evidence(
    business_id: str
) -> list[dict]:

    subset = (
        review_evidence.loc[
            review_evidence[
                "business_id"
            ]
            ==
            business_id
        ]
        .sort_values(
            "text_representativeness",
            ascending=False
        )
        .head(3)
        .copy()
    )


    evidence = []


    for row in subset.to_dict(
        "records"
    ):

        text = str(
            row.get(
                "text",
                ""
            )
        )

        text = " ".join(
            text.split()
        )


        # Keep the UI readable while preserving
        # a genuine excerpt from the training review.
        if len(text) > 700:

            text = (
                text[:697]
                +
                "..."
            )


        evidence.append({
            "business_id":
                str(
                    row[
                        "business_id"
                    ]
                ),

            "review_id":
                str(
                    row[
                        "review_id"
                    ]
                ),

            "date":
                str(
                    _safe_value(
                        row.get(
                            "date"
                        )
                    )
                ),

            "stars":
                int(
                    row[
                        "stars"
                    ]
                ),

            "text_representativeness":
                float(
                    row[
                        "text_representativeness"
                    ]
                ),

            "text_excerpt":
                text,
        })


    return evidence


# ==================================================
# Dynamic visual evidence
# ==================================================

def dynamic_visual_evidence(
    business_id: str
) -> list[dict]:

    subset = (
        visual_evidence.loc[
            visual_evidence[
                "business_id"
            ]
            ==
            business_id
        ]
        .sort_values(
            "visual_representativeness",
            ascending=False
        )
        .head(5)
        .copy()
    )


    available_photos = {
        photo[
            "photo_id"
        ]:
            photo

        for photo
        in business_photos(
            business_id
        )
    }


    output = []


    for row in subset.to_dict(
        "records"
    ):

        photo_id = str(
            row[
                "photo_id"
            ]
        )


        photo = (
            available_photos.get(
                photo_id
            )
        )


        if photo is None:

            continue


        output.append({
            "business_id":
                business_id,

            "photo_id":
                photo_id,

            "label":
                str(
                    row.get(
                        "label",
                        ""
                    )
                ),

            "image_url":
                photo[
                    "image_url"
                ],

            "visual_representativeness":
                float(
                    row[
                        "visual_representativeness"
                    ]
                ),
        })


    return output


# ==================================================
# Dynamic user-history / KG evidence
# ==================================================

def dynamic_history_evidence(
    user_id: str,
    target_business_id: str
):

    target_record = (
        _coverage_record(
            target_business_id
        )
    )


    if target_record is None:

        return (
            [],
            [],
            0.0
        )


    target_categories = (
        _parse_categories(
            target_record.get(
                "categories"
            )
        )
    )


    target_category_set = set(
        target_categories
    )


    user_interactions = (
        review_evidence.loc[
            review_evidence[
                "user_id"
            ]
            ==
            user_id
        ][
            [
                "business_id",
                "date",
                "stars"
            ]
        ]
        .drop_duplicates(
            subset=[
                "business_id"
            ]
        )
        .copy()
    )


    if user_interactions.empty:

        return (
            [],
            [],
            0.0
        )


    history_metadata = (
        user_interactions
        .merge(
            unified_coverage[
                [
                    "business_id",
                    "name",
                    "categories"
                ]
            ],

            on=
                "business_id",

            how=
                "left"
        )
    )


    history_rows = []


    for row in history_metadata.to_dict(
        "records"
    ):

        historical_business_id = str(
            row[
                "business_id"
            ]
        )


        if (
            historical_business_id
            ==
            target_business_id
        ):

            continue


        historical_categories = set(
            _parse_categories(
                row.get(
                    "categories"
                )
            )
        )


        shared_categories = sorted(
            target_category_set
            &
            historical_categories
        )


        history_rows.append({
            "business_id":
                historical_business_id,

            "name":
                str(
                    row.get(
                        "name",
                        historical_business_id
                    )
                ),

            "shared_categories":
                ", ".join(
                    shared_categories
                ),

            "shared_category_count":
                len(
                    shared_categories
                ),
        })


    history_rows = sorted(
        history_rows,

        key=lambda row: (
            -row[
                "shared_category_count"
            ],
            row[
                "name"
            ]
        )
    )


    category_overlap = []


    for category in target_categories:

        count = 0


        for row in history_metadata.to_dict(
            "records"
        ):

            historical_categories = set(
                _parse_categories(
                    row.get(
                        "categories"
                    )
                )
            )


            if category in historical_categories:

                count += 1


        category_overlap.append({
            "category":
                category,

            "historical_business_count":
                int(
                    count
                ),
        })


    represented_categories = sum(
        1

        for row
        in category_overlap

        if (
            row[
                "historical_business_count"
            ]
            >
            0
        )
    )


    if target_categories:

        support_fraction = (
            represented_categories
            /
            len(
                target_categories
            )
        )

    else:

        support_fraction = 0.0


    return (
        category_overlap,
        history_rows,
        float(
            support_fraction
        )
    )


# ==================================================
# Dynamic K4 explanation
# ==================================================

def dynamic_evidence(
    business_id: str,
    user_row: int
) -> dict | None:

    comparison = (
        frozen_comparison(
            user_row,
            2516
        )
    )


    result = next(
        (
            row

            for row
            in comparison[
                "comparison"
            ]

            if (
                row[
                    "business_id"
                ]
                ==
                business_id
            )
        ),
        None
    )


    if result is None or not all(math.isfinite(result[key]) for key in ("nv_score", "mm_score")):

        return None


    user_id = str(
        comparison[
            "user_id"
        ]
    )


    (
        category_overlap,
        history_rows,
        support_fraction
    ) = dynamic_history_evidence(
        user_id=
            user_id,

        target_business_id=
            business_id
    )


    visual_rows = (
        dynamic_visual_evidence(
            business_id
        )
    )


    strength_rows = matching(
        visual_strength,
        business_id=business_id
    )


    if strength_rows:

        strength = (
            strength_rows[0]
        )

        selected_image_count = int(
            strength.get(
                "selected_image_count"
            )
            or
            0
        )

        label_diversity = int(
            strength.get(
                "label_diversity"
            )
            or
            0
        )

    else:

        selected_image_count = 0
        label_diversity = 0


    summary = {
        "business_id":
            business_id,

        "user_id":
            user_id,

        "user_row":
            int(
                user_row
            ),

        "nv_rank":
            int(
                result[
                    "nv_rank"
                ]
            ),

        "mm_rank":
            int(
                result[
                    "mm_rank"
                ]
            ),

        "target_category_support_fraction":
            float(
                support_fraction
            ),

        "selected_image_count":
            selected_image_count,

        "label_diversity":
            label_diversity,

        # These are deliberately absent for
        # non-K5 cases. Do not fabricate an
        # individual visual perturbation result.
        "target_visual_score_gain":
            None,

        "target_visual_rank_gain":
            None,

        "competitive_visual_rank_effect":
            None,
    }


    return {
        "source":
            "frozen-model",

        "summary":
            summary,

        "category_overlap":
            category_overlap,

        "history":
            history_rows,

        "text":
            dynamic_text_evidence(
                business_id
            ),

        "visual":
            visual_rows,
    }


# ==================================================
# Main explanation function
# ==================================================

def case_evidence(
    business_id: str,
    user_row: int
) -> dict | None:

    """
    Build explanation evidence from the full K4
    artefacts for every frozen recommendation.

    Where an exact K5 dissertation case exists,
    overlay only its exported visual-sensitivity
    diagnostics.
    """

    evidence = dynamic_evidence(
        business_id=business_id,
        user_row=user_row
    )

    if evidence is None:
        return None


    # ------------------------------------------
    # Optional K5 diagnostic enrichment
    # ------------------------------------------

    cases = matching(
        summaries,
        business_id=business_id,
        user_row=user_row
    )

    if not cases:
        return evidence


    case = cases[0]

    summary = evidence[
        "summary"
    ]


    # Only use K5 diagnostics when the frozen
    # identity and ranks still match exactly.
    same_case = (
        str(
            case.get(
                "user_id"
            )
        )
        ==
        summary[
            "user_id"
        ]
        and
        int(
            case.get(
                "nv_rank"
            )
        )
        ==
        summary[
            "nv_rank"
        ]
        and
        int(
            case.get(
                "mm_rank"
            )
        )
        ==
        summary[
            "mm_rank"
        ]
    )


    if not same_case:
        return evidence


    summary[
        "target_visual_score_gain"
    ] = case.get(
        "target_visual_score_gain"
    )

    summary[
        "target_visual_rank_gain"
    ] = case.get(
        "target_visual_rank_gain"
    )

    summary[
        "competitive_visual_rank_effect"
    ] = case.get(
        "competitive_visual_rank_effect"
    )


    return evidence
