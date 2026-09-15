# Knowledge-aware-recommender-system

Research notebooks for a KGRec-inspired recommender using the New Orleans Yelp subset. The study compares non-visual and multimodal representations and examines ranking performance, visual ablation and explanation evidence.

## Notebooks

The notebooks are organised in pipeline order:

| Notebook | Purpose |
| --- | --- |
| [00 — Dataset extraction](Dataset_exploration/00_yelp_dataset_extration.ipynb) | Extract the local Yelp data. |
| [01 — Dataset exploration](Dataset_exploration/01_yelp_dataset_exploration.ipynb) | Explore businesses and interactions and prepare the experimental subset. |
| [02 — Image embeddings](Dataset_exploration/02_yelp_image_embeddings.ipynb) | Select business photos and generate image representations. |
| [03 — Text embeddings](Dataset_exploration/03_yelp_text_embeddings.ipynb) | Prepare training-review text representations. |
| [04 — Metadata knowledge graph](Dataset_exploration/04_yelp_metadata_knowledge_graph.ipynb) | Prepare structured business information and graph relations. |
| [05 — Recommendation model](Dataset_exploration/05_yelp_kgrec_model.ipynb) | Train and evaluate the recommendation models. |
| [06 — Visualisation](Dataset_exploration/06_yelp_visualization.ipynb) | Plot experimental results, including the corrected G7.8 confidence-interval labels. |
| [07 — Explanation layer](Dataset_exploration/07_yelp_explanation_layer.ipynb) | Analyse frozen model behaviour and selected explanation cases. |

## Viewing and running

Each notebook includes its saved cell outputs and embedded figures. Open an `.ipynb` file on GitHub to preview it, or open it in Jupyter or VS Code locally.

Execution requires the local Yelp datasets, intermediate artefacts and model outputs referenced in the notebook cells, plus the Python packages imported by each notebook. Check the path configuration cells for machine-specific paths before running. The notebooks were copied with their existing outputs; they were not re-executed for this commit.

This repository contains the eight main research notebooks, the [Local Table demo](Demo_app/README.md), and both processed-data folders. The local `08_demo_data_export.ipynb` file was empty and is omitted. Duplicate notebook folders and installed dependencies are omitted.

## Demo and processed data

- `Demo_app/`: the Next.js frontend, FastAPI backend, bundled assets and tests, including catalogue search and the exact notebook-case view.
- `Dataset_exploration/processed_data/`: the research pipeline outputs, embeddings, frozen model bundle, explanations, figures and preparation archives.
- `processed_data/`: additional processed subset tables and archive from the project root.

The processed data includes large binary files stored with Git LFS. Install Git LFS before cloning, or run `git lfs pull` in an existing checkout:

```sh
git lfs install
git clone https://github.com/Pnabena/Knowledge-aware-recommender-system.git
cd Knowledge-aware-recommender-system
git lfs pull
```

Follow [the demo startup instructions](Demo_app/README.md) to install dependencies and run both servers. The prepared Python environment path in that README belongs to the original development machine; create your own environment when running elsewhere.

The original Yelp JPEG library remains a separate dependency at `Dataset_exploration/Image_files/photos/`. Restore it locally to display the selected business photos; missing files appear as unavailable images. The bulk original Yelp datasets and photo archives are not part of this commit.
