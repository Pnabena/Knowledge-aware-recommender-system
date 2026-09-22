# Local Table — static KGRec dissertation demo

The demo runs entirely from static HTML, JavaScript, JSON and bundled photos. It does not call FastAPI, load model weights at runtime or require a live Python/Next.js backend.

## Run locally

From `Demo_app`:

```sh
npm ci
npm run build
npm start
```

Open <http://127.0.0.1:3000>. `npm start` serves the already-built `out/` directory using a small static file server. Use `PORT=3001 npm start` to choose another port. For frontend development, `npm run dev -- --hostname 127.0.0.1` also uses the static snapshot.

## Deploy

Publish the **contents of `Demo_app/out/`** to a static host at the site root. All business routes are generated at build time, including direct links and page refreshes; no API rewrites or image-optimisation server are needed. This uses Next.js [static export](https://nextjs.org/docs/app/guides/static-exports).

For a frontend hosting project, use:

| Setting | Value |
| --- | --- |
| Root directory | `Demo_app` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `out` |
| Backend/environment variables | None |

The committed `vercel.json` pins the install/build commands and exported `out` directory, using Vercel's static hosting preset (`framework: null`). A repository-root configuration also supports Vercel projects whose Root Directory is left at the repository root. Both configurations publish the same demo; no `npm start` process runs in production.

If the public domain still shows an older version, open the latest deployment for the correct Vercel project, confirm its source commit, and promote that deployment to production. A successful GitHub deployment status alone does not verify which version a public domain is serving. The deployed `/data/manifest.json` should return JSON with 2,516 businesses and five notebook cases.

The existing repository-root Dockerfile and Railway configuration belong to the optional live research API. They are not required for the static demo. The former setup is preserved in [the live-backend reference](docs/live-backend-reference.md).

## Bundled snapshot

- `public/data/feed.json`: the exact top 30 KGRec-MM businesses for presentation user **3279**.
- `public/data/catalogue.json`: all **2,516** searchable businesses with original global NV/MM ranks, including null ranks for training/validation exclusions.
- `public/data/businesses/{business_id}.json`: the profile, demo-user ranking and explanation, plus the exact selected notebook case when available.
- `public/data/notebook-cases.json`: the five exported dissertation case identities.
- `public/data/manifest.json`: snapshot counts and SHA-256 hashes for every exported JSON and photo file.
- `public/photos/`: the **6,122** selected JPEGs available in the local source at export time, copied unchanged. Photos missing in the source remain unavailable; their absence does not change the frozen visual-feature mask.

These files are the runtime data. Include both `public/data` and `public/photos` when sharing or committing the app. Python, the processed-data directory and the original photo library are needed only to regenerate the snapshot. Rebuild the site after regenerating it. JavaScript and an HTTP static host are required; double-clicking `index.html` via `file://` is not supported.

## Search and exact notebook cases

Search runs in the browser across names, categories and addresses in the complete catalogue. It supports partial names such as `emeril`, ignores case and apostrophe differences, and keeps the original global model ranks. Results are filtered, not reranked. Profiles outside the top 30 remain accessible.

For You and search use user **3279**. Selected case profiles offer a labelled **Notebook case** switch using the original experimental user. Ruby Slipper (`oBNrLz4EDhiscSlbOl8uAw`) has:

| Context | NV → MM | Category coverage | Strongest historical match |
| --- | --- | --- | --- |
| Demo user 3279 | 64 → 20 | 4/5 (80%) | Commander's Palace |
| Notebook user 3072 | 52 → 13 | 3/5 (60%) | Russell's Marina Grill |

Open `/business/oBNrLz4EDhiscSlbOl8uAw/?case=notebook` to view the exact case. Its **+713** target-visual rank sensitivity means removing the target visuals worsens the rank number from **13 to 726**. Emeril's selected case uses user **672** with ranks **19 → 49**. All five explanation tabs, category filters, photo galleries, saved places and location preferences remain available. Saved places and location preferences last for the current browsing session and reset on a full reload.

## Regenerate the frozen snapshot

Run the export with the original research artefacts available next to `Demo_app`. The exporter imports the existing frozen backend functions directly; it does not start an API server or retrain a model.

```sh
# With the prepared local environment on the original development machine:
/Users/preye/.venvs/local-table-demo/bin/python -m backend.export_static

# Or, in your own activated environment with backend/requirements.txt installed:
npm run export:data

npm run build
```

The exporter builds a complete snapshot in a temporary directory before replacing `public/data` and `public/photos`. It copies only allowlisted selected photos and records hashes. Existing export directories are replaced, so do not put manually maintained files inside them.

Source artefacts under `Dataset_exploration/processed_data/` include the frozen `new_orleans_demo/live_inference/` bundle, the personalised business catalogue, image selection/embedding indexes, and the K4/K5 explanation outputs. The JPEG source is `Dataset_exploration/Image_files/photos/`. The recommender remains unchanged with SHA-256 `1bdb1831dc6e6c8b6d28a3ac8d76d25c7e55a7b3c8c87dab80b7e46b90e45487`.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

The browser checks use installed Google Chrome and start only a static file server on port 4173. They check home, search, deep-link reloads, demo/notebook context switching, all explanation tabs, saves, mobile layout and retrying a failed data request; unexpected external requests fail the test. Snapshot tests verify every exported file hash and all business/case identities.

## Scope

This is a fixed research snapshot: it supports demo user 3279 and the five selected notebook cases, not arbitrary live user inference. Yelp metadata and explanations describe the frozen dataset, not current opening hours or causal attribution. Changing the selected city stores a preference; the catalogue remains New Orleans. Missing evidence is shown explicitly and never replaced with mock results.
