# Explainable Multimodal Knowledge-Aware Recommender System

A KGRec-inspired personalised recommender system for local-business discovery that integrates behavioural interactions, structured knowledge-graph information, review-text representations and visual information.

The project investigates a central question:

> Does visual information improve personalised recommendation when added to an equivalent knowledge-aware text-and-graph recommender?

The system was evaluated on the Yelp Open Dataset using controlled non-visual and multimodal configurations, full-catalogue recommendation, visual ablation and evidence-grounded explanation analysis.

---

## Key Result

The multimodal model (**KGRec-MM**) improved **8 of 9 reported top-K recommendation metrics** compared with the equivalent non-visual model (**KGRec-NV**).

| Metric | KGRec-NV | KGRec-MM | Relative change |
|---|---:|---:|---:|
| Recall@5 | 0.0404 | 0.0417 | +3.14% |
| NDCG@5 | 0.0264 | 0.0267 | +0.99% |
| MAP@5 | 0.0218 | 0.0218 | -0.21% |
| Recall@10 | 0.0643 | 0.0676 | +5.08% |
| NDCG@10 | 0.0341 | 0.0350 | +2.52% |
| MAP@10 | 0.0250 | 0.0251 | +0.68% |
| Recall@20 | 0.1009 | 0.1110 | **+10.05%** |
| NDCG@20 | 0.0432 | 0.0459 | **+6.12%** |
| MAP@20 | 0.0274 | 0.0281 | +2.50% |

The strongest evidence appeared at K=20, where confidence intervals for the Recall and NDCG improvements excluded zero.

The results also show that visual information is **not uniformly beneficial**. Its contribution varies with behavioural support, image availability and visual richness.

---

## System Overview

The recommendation architecture integrates four information sources:

### Behavioural information
User-business interactions used to model personalised preference.

### Structured information
Business categories and attributes represented through a heterogeneous knowledge graph.

### Textual information
Training-period Yelp reviews encoded using **BGE-small-en-v1.5** into 384-dimensional business representations.

### Visual information
Selected Yelp business photographs encoded using **CLIP ViT-B/32** into 512-dimensional visual representations.

Two controlled systems were evaluated:

**KGRec-NV**

Behavioural + structured knowledge graph + review text

**KGRec-MM**

Behavioural + structured knowledge graph + review text + visual information

Keeping the surrounding architecture equivalent allows the contribution of visual information to be evaluated directly.

---

## Dataset & Experimental Scale

The study uses a New Orleans subset of the Yelp Open Dataset.

| Component | Scale |
|---|---:|
| Users | 14,991 |
| Businesses | 2,516 |
| Training interactions | 122,233 |
| Knowledge-graph triples | 206,222 |
| Knowledge-graph entities | 17,819 |
| Relation types | 64 |
| Businesses with visual evidence | 1,729 |
| Image-less businesses | 787 |

The knowledge graph combines structured business metadata with positive user-business interactions while excluding validation and test interactions to prevent leakage.

---

## Recommendation Pipeline

```text
Yelp Open Dataset
        |
        v
Business metadata + Reviews + User interactions + Photos
        |
        +--------------------+
        |                    |
        v                    v
Knowledge Graph         Text Representations
                       BGE-small-en-v1.5
        |                    |
        +----------+---------+
                   |
                   v
           KGRec-NV Model
                   |
          +--------+--------+
          |                 |
          |          CLIP Visual
          |         Representations
          |                 |
          +--------+--------+
                   |
                   v
           KGRec-MM Model
                   |
                   v
        Full-Catalogue Ranking
                   |
                   v
 Recall / NDCG / MAP Evaluation
                   |
                   v
  Explanation & Model Analysis

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

