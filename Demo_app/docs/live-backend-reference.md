# Previous live-backend setup (reference only)

The frontend now uses a static snapshot. These previous instructions are retained for the research API and historical deployment configuration. See ../README.md for the current startup instructions.

# Local Table — frozen KGRec dissertation demo

The For You feed shows the **real top 30 KGRec-MM businesses for experimental user row 3279**, in the verified frozen ranking order. Names, categories, Yelp stars, review counts and addresses come from the 2,516-business personalised catalogue. Feed cards, ranking rows and profiles use the same real business IDs and selected Yelp photos.

The parrot logo, restaurant category SVGs, Manrope font and US city preference dropdown are retained. The Home feed preserves the original staggered portrait crops and compact labels overlaid on each photo; photo dimensions do not flatten the masonry layout.

## Run locally

The backend requires the existing research files next to `Demo_app`; it does not train a model or download a dataset. A working Python environment was prepared at `/Users/preye/.venvs/local-table-demo`. Python virtual environments must live outside this project's colon-containing path.

Start FastAPI in one terminal:

```sh
cd '/Users/preye/Downloads/Masters AI:ML/Masters Project/Demo_app'
/Users/preye/.venvs/local-table-demo/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Start Next.js in a second terminal:

```sh
cd '/Users/preye/Downloads/Masters AI:ML/Masters Project/Demo_app'
npm run dev -- --hostname 127.0.0.1
```

Open <http://127.0.0.1:3000>. For a production preview, run `npm run build`, then `npm start -- --hostname 127.0.0.1` instead of the dev command. Run only one Next.js server on port 3000.

To recreate the environment on this machine:

```sh
python3 -m venv "$HOME/.venvs/local-table-demo"
"$HOME/.venvs/local-table-demo/bin/python" -m pip install -r backend/requirements.txt
npm install
```

Python 3.14 and Node 26 were used for validation. The scripts also support Node 22. `RECOMMENDER_API_URL` defaults to `http://127.0.0.1:8000`; `.env.example` documents the override. Set it before building if changing the backend address, because the image rewrite is built into Next.js configuration.

## Deploy the API on Railway (Vercel frontend)

Vercel hosts Next.js only. FastAPI must run as a separate Railway service that can read the frozen research files.

1. Push [the GitHub repository](https://github.com/Pnabena/Knowledge-aware-recommender-system) including `Dockerfile`, `railway.toml`, and Git LFS objects (`git lfs pull` before pushing if those files are still pointers).
2. In Railway: **New project → Deploy from GitHub** → that repository. Leave the **root directory empty**. Do not set it to `Demo_app`, or Railway will try to build the Next.js app.
3. Give the service at least **1 GB RAM**. After deploy, open the generated URL (for example `https://something.up.railway.app`) and check `/health`.
4. Optional Railway variable: `CORS_ORIGINS=https://your-production.vercel.app` (comma-separated). Preview URLs on `*.vercel.app` are allowed by default.
5. In Vercel, set `RECOMMENDER_API_URL` to that Railway HTTPS origin (**no trailing slash**) for Production and Preview, then **redeploy** the frontend.

The Docker image copies the frozen bundle, catalogue parquet, image manifest/index, and explanation tables. It does **not** copy `Dataset_exploration/Image_files/photos/` (about 7 GB and not in GitHub). Rankings and explanations still work; selected JPEGs return 404 until those files are available on the host.

## Search and notebook cases

Search matches business names, categories and addresses across all 2,516 catalogue businesses, including partial names such as `emeril`. Results keep the original global NV/MM ranks for demo user 3279. Training/validation exclusions remain searchable, with no recommendation rank. A profile can show evidence outside the top 30.

The five notebook cases use different experimental users. Each selected business profile offers an explicit **Notebook case** link alongside **Demo user 3279**. Notebook mode reads the exact K5 summary, category overlap, history, text and visual exports and verifies its user identity and ranks against the frozen bundle before displaying them. The page and explanation drawer identify the selected user.

For Ruby Slipper (`oBNrLz4EDhiscSlbOl8uAw`), demo user 3279 has ranks **64 → 20**, **4/5** category coverage and **Commander's Palace** as the strongest match. The selected notebook case uses user **3072**, with **52 → 13**, **3/5 (60%)**, **Russell's Marina Grill**, and target-visual rank sensitivity **+713**. Open `/business/oBNrLz4EDhiscSlbOl8uAw?case=notebook` for that case. Emeril's notebook case uses user **672**, with ranks **19 → 49**.

Rank sensitivity uses the exported sign: masked rank minus full-model rank. Positive means the numerical rank worsens on removal; Ruby Slipper moves from **13 to 726**. Score change remains masked score minus full score. Catalogue metadata categories may differ from frozen KG categories; the coverage denominator comes from the selected evidence's category list.

## Data provenance and endpoints

All paths below are relative to `../Dataset_exploration/`.

| Purpose | Actual source |
| --- | --- |
| Frozen representations, row indexes, exclusions and visual mask | `processed_data/new_orleans_demo/live_inference/` |
| Exact business metadata and stars | `processed_data/new_orleans_subset/new_orleans_personalisation_businesses.parquet` |
| Label-aware selected photos, original selection order, dimensions | `processed_data/new_orleans_image_pipeline/new_orleans_image_embedding_manifest.parquet` |
| Confirmation that a selected photo was embedded | `processed_data/new_orleans_image_pipeline/clip_vit_b32_embeddings/new_orleans_clip_vit_b32_image_embedding_index.parquet` |
| Original JPEG files, served in place | `Image_files/photos/` |
| Frozen explanation evidence | `processed_data/new_orleans_model_outputs/explanations/k4_*.parquet`; optional diagnostics from `k5_case_behaviour_summary.csv` |

There are 6,681 selected photos covering all 1,729 visually supported businesses, up to five per business. The other 787 businesses receive `image_url: null` and an empty photo list. No stock images, guessed filenames, nearest-business matches or fabricated ratings are used. If a genuine selected file becomes unavailable, it is omitted; its absence never changes the frozen visual-feature mask.

| Endpoint | Behavior |
| --- | --- |
| `GET /health` | Service health |
| `GET /search?q=emeril&user_row=3279` | Query matching across the full catalogue; original global ranks and null ranks for excluded businesses |
| `GET /notebook-cases` | The five exported K5 case identities and summaries |
| `GET /businesses/{business_id}/ranking?user_row=3279` | Exact eligible-business ranks at any position, or null for exclusions |
| `GET /businesses/{business_id}/notebook-case` | Exact selected K5 user/business evidence, validated against the frozen ranks |
| `GET /model-status` | Existing frozen bundle status |
| `GET /rankings/3279?k=20` | Existing exact NV/MM ranks; comparison rows also carry a genuine selected `image_url` when available |
| `GET /feed/3279?k=30` | Existing MM top-K order joined to real metadata and selected photos; no query conditioning |
| `GET /businesses/{business_id}` | Same-ID catalogue metadata, attributes, hours, selected photos and available exported review excerpts |
| `GET /businesses/{business_id}/explanation?user_row=3279` | K4 evidence for frozen recommendations; K5 sensitivity diagnostics only when the exact user/business/ranks match |
| `GET /business-image/{photo_id}` | Allowlisted selected JPEG only; unknown IDs and paths outside the photo directory return 404 |

Next.js proxies `/business-image/{photo_id}` to FastAPI, so images use the same origin as the UI and no bulk image copying is needed. API inputs are validated; unknown businesses return 404. No API failure falls back to mocks. Home is rendered dynamically, so a build does not require loading personalised recommendations.

## Preserved experiment

`backend/recommender.py` was **not modified**. Its SHA-256 remains:

```text
1bdb1831dc6e6c8b6d28a3ac8d76d25c7e55a7b3c8c87dab80b7e46b90e45487
```

Verified status: 14,991 users; 2,516 businesses; 1,729 visual businesses; 787 image-less businesses; `retraining: false`.

Verified Herbsaint case: `ZTctPm8-lBy0iJ9dFhYhyQ`, NV **44**, MM **6**, improvement **38**, Yelp stars **4.0**, review count **879**. Its first selected photo is `Sy4raAjYQcwxiOWOz9erRg` (`inside`, selection rank 1).

The original five-tab explanation drawer is available on every recommended business profile. When detailed evidence is absent, it still shows the verified ranks and explicit unavailable states in the evidence tabs. K4 supplies full genuine training history (including zero category overlap), category overlap, representative training-review excerpts and selected visual evidence. K5 enriches only the three sensitivity diagnostics when identity and ranks match. Herbsaint under presentation user 3279 returns 10 history businesses, 3 reviews and 5 photos, plus its verified sensitivity measurements. The existing drawer continues to display representative subsets of history connections and photos. The score gain is negated for removal-minus-full score change. Rank sensitivity preserves the exported masked-minus-full sign; Herbsaint's rank sensitivity on removal is **+762** (rank 6 to 768). These measurements are associated evidence, not causal attribution.

## Files changed

| Files | Change |
| --- | --- |
| `backend/catalogue.py` | Validated catalogue/photo joins, safe photo lookup, real MM feed and non-mutating image enrichment of rankings |
| `backend/evidence.py` | K4 recommendation evidence with optional exact-user K5 diagnostics; no synthetic explanations |
| `backend/main.py`, `backend/cors.py` | Feed, profile, explanation and allowlisted image endpoints; Railway/Vercel CORS origins |
| `backend/requirements.txt`, `.gitignore` | Reproducible Python dependencies and environment/cache exclusions |
| `src/lib/api.ts`, `.env.example` | Shared server API boundary and fixed presentation user |
| `src/lib/feed.ts`, `src/lib/business-adapter.ts`, `src/types/api.ts`, `src/types/business.ts` | Real feed DTO adaptation, actual-category tabs, metadata/rank fields and saved-profile card adaptation |
| `src/lib/rankings.ts` | Exact existing ranks and actual stars/photos from the enriched service |
| `src/lib/business-profile.ts`, `src/types/explanation.ts` | Real same-ID profiles and strictly scoped frozen explanation adaptation; photo availability separated from model visual support |
| `next.config.ts`, `src/app/page.tsx`, `src/app/error.tsx` | Same-origin photo proxy, dynamic Home rendering and honest service-error state |
| `src/components/discovery-shell.tsx`, `discovery-state.tsx`, `masonry-grid.tsx`, `business-card.tsx` | Real feed provenance, saved real businesses beyond top 30, missing-image fallback and exact fractional star display |
| `src/components/profile/business-summary.tsx`, `business-profile-page.tsx` | Exact Yelp review count/metadata, absent-evidence state, same-ID saves and top-of-profile navigation |
| `src/components/explanation/evidence-panels.tsx` | Use the frozen visual mask independently from whether an image file can currently be displayed |
| `backend/test_dataset.py`, `tests/business-profile.test.mjs`, `tests/fixtures/frozen-dataset.json` | Actual-dataset integration checks and adapter tests using captured real responses |
| `src/components/brand-mark.tsx`, `business-icon.tsx`, `header.tsx`, `location-dropdown.tsx`, `src/data/locations.ts` | Supplied parrot/category artwork and accessible 24-city preference dropdown |
| `src/components/ranking/business-image.tsx`, `ranking-result-card.tsx`, `src/components/explanation/missing-visual-state.tsx`, `knowledge-graph-evidence.tsx` | Category artwork for business placeholders and graph nodes |
| `src/app/layout.tsx`, `globals.css`, `location.css`, `profile.css`, `explanation.css`, `knowledge-graph.css`, `icon.svg`, `fonts/`, `public/brand/`, `public/icons/` | Locally bundled Manrope, supplied SVGs/favicon, shared brand colours and consistent corners |
| `README.md` | Startup commands, provenance, endpoints, validation and limitations |

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
/Users/preye/.venvs/local-table-demo/bin/python -m unittest backend.test_dataset -v
```

The frontend tests check rank presentation and real-response adaptation, same-ID photos/ratings, absent visuals, matching explanation context, sensitivity signs, URL encoding and no mock fallback. The backend integration tests check the unchanged recommender checksum, model status, Herbsaint ranks, exact feed ordering, metadata consistency, all 2,516 businesses' photo ownership/masks, exact JPEG bytes, symlink/path restrictions and invalid inputs.

Browser checks cover real Home/search/profile navigation, all five Herbsaint explanation tabs, category filtering, photo cycling, saves including a real image-less business outside the top 30, location selection and responsive layouts at 320, 390, 599, 600, 768, 1024, 1440 and 1888px.

## Current limits

- For You and search use experimental user **3279**. The explicit Notebook case view uses each selected case’s original experimental user. No training, authentication or query-conditioned reranking was added.
- The city dropdown records a session preference. The frozen catalogue remains **New Orleans**, regardless of that selection; this is stated in the menu and feed. Selection and saves persist across app navigation, then reset on a full reload.
- Category tabs filter the current recommended set using genuine Yelp category membership. They do not rerank or fabricate additional results.
- Personalised K4 evidence is returned for frozen recommendations. Ordinary businesses have null K5 sensitivity diagnostics, displayed as unavailable in the existing Model Behaviour tab. All five drawer tabs remain available, with explicit states for any missing evidence. Exported review excerpts exist only for selected cases; reviewer names are not supplied, so the UI labels them generically as “Yelp reviewer.”
- Yelp metadata, hours and attributes describe the dataset snapshot, not live operating status.
- Legacy mock fixture files and illustrative photo assets remain on disk for earlier prototype/reference tests, but the runtime feed, rankings and profile providers do not import them.
- FastAPI and the local research/photo files must be available when browsing. No images were duplicated into `public/`.
