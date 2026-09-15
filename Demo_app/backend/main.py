from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from backend.catalogue import business_detail, business_ranking, enriched_comparison, feed_for_user, photo_path, search_businesses
from backend.evidence import case_evidence, notebook_cases, notebook_case_evidence, review_excerpts

from backend.recommender import (
    bundle,
)


app = FastAPI(
    title="Local Business Recommender Demo API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health_check():

    return {
        "status": "ok",
        "service": "frozen-kgrec-demo-api"
    }


@app.get("/model-status")
def model_status():

    return bundle.status()


@app.get("/rankings/{user_row}")
def rankings(
    user_row: int = Path(ge=0, lt=14991),
    k: int = Query(default=20, ge=1, le=100)
):

    return enriched_comparison(
        user_row=user_row,
        k=k
    )


@app.get("/feed/{user_row}")
def feed(user_row: int = Path(ge=0, lt=14991), k: int = Query(default=30, ge=1, le=100)):
    return feed_for_user(user_row, k)


@app.get("/businesses/{business_id}")
def business(business_id: str):
    detail = business_detail(business_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Business is not in the frozen catalogue")
    return {**detail, "review_excerpts": review_excerpts(business_id)}


@app.get("/search")
def search(q: str = Query(min_length=1, max_length=200), user_row: int = Query(default=3279, ge=0, lt=14991)):
    return search_businesses(q.strip(), user_row)


@app.get("/notebook-cases")
def selected_notebook_cases():
    return notebook_cases()


@app.get("/businesses/{business_id}/ranking")
def ranking_for_business(business_id: str, user_row: int = Query(default=3279, ge=0, lt=14991)):
    if business_detail(business_id) is None:
        raise HTTPException(status_code=404, detail="Business is not in the frozen catalogue")
    return business_ranking(business_id, user_row)


@app.get("/businesses/{business_id}/notebook-case")
def selected_notebook_case(business_id: str):
    return notebook_case_evidence(business_id)


@app.get("/businesses/{business_id}/explanation")
def explanation(business_id: str, user_row: int = Query(default=3279, ge=0, lt=14991)):
    if business_detail(business_id) is None:
        raise HTTPException(status_code=404, detail="Business is not in the frozen catalogue")
    return case_evidence(business_id, user_row)


@app.get("/business-image/{photo_id}")
def business_image(photo_id: str):
    path = photo_path(photo_id)
    if path is None:
        raise HTTPException(status_code=404, detail="Selected Yelp photo is unavailable")
    return FileResponse(path, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff"})
