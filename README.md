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



Explainability & Model Analysis

The project deliberately separates evidence from causal explanation.

Recommendation analysis includes:

Knowledge-graph evidence
Representative training-review evidence
Representative visual evidence
User-history/category overlap
Learned modality allocation
Visual perturbation analysis
Controlled multimodal versus non-visual ranking comparison

Visual perturbation was used to examine how the frozen model responds when visual information is removed at inference time.

Evidence is presented as information associated with the recommendation rather than as proof that any single feature caused the ranking.

Research Demonstrator

A web demonstrator was developed to expose the frozen recommendation system through an interactive interface.

Frontend: Next.js / React / TypeScript
Backend: FastAPI
Model state: Frozen evaluated outputs — no model retraining

The application includes:

Personalised visual recommendation feed
Full catalogue search
KGRec-MM vs KGRec-NV ranking comparison
Business profiles
Knowledge-graph evidence
Text evidence
Visual evidence
Model-behaviour analysis
Selected research-case views

A static public portfolio version is currently being prepared so the evaluated system can be explored without requiring the complete local research environment.



Frozen research outputs
        |
        v
     FastAPI
        |
        v
   Next.js / React
        |
        +---- Personalised feed
        +---- Search
        +---- Ranking comparison
        +---- Business profiles
        +---- Explanation evidence


        Technology

Machine Learning

Python
PyTorch
BGE-small-en-v1.5
CLIP ViT-B/32
Knowledge-aware recommendation

Data

Pandas
NumPy
PyArrow

Application

FastAPI
Next.js
React
TypeScript

Evaluation

Recall@K
NDCG@K
MAP@K
Bootstrap analysis
Ablation and perturbation analysis


Research Conclusion

Visual information provided a useful complementary signal for personalised local-business recommendation, but its value was conditional rather than universal.

The strongest multimodal gains appeared at broader recommendation cut-offs, while detailed analysis showed that visual contribution depends on the surrounding behavioural and content evidence.

This highlights an important design principle for multimodal recommender systems:

More modalities do not automatically produce better recommendations. Their value depends on when and how they contribute useful evidence.


