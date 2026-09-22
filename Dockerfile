# FastAPI only. Do not set Railway's root directory to Demo_app:
# Nixpacks would see package.json and try to build Next.js.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/Demo_app

WORKDIR /app

COPY Demo_app/backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY Demo_app /app/Demo_app
COPY Dataset_exploration/processed_data/new_orleans_demo/live_inference /app/Dataset_exploration/processed_data/new_orleans_demo/live_inference
COPY Dataset_exploration/processed_data/new_orleans_subset/new_orleans_personalisation_businesses.parquet /app/Dataset_exploration/processed_data/new_orleans_subset/new_orleans_personalisation_businesses.parquet
COPY Dataset_exploration/processed_data/new_orleans_image_pipeline/new_orleans_image_embedding_manifest.parquet /app/Dataset_exploration/processed_data/new_orleans_image_pipeline/new_orleans_image_embedding_manifest.parquet
COPY Dataset_exploration/processed_data/new_orleans_image_pipeline/clip_vit_b32_embeddings/new_orleans_clip_vit_b32_image_embedding_index.parquet /app/Dataset_exploration/processed_data/new_orleans_image_pipeline/clip_vit_b32_embeddings/new_orleans_clip_vit_b32_image_embedding_index.parquet
COPY Dataset_exploration/processed_data/new_orleans_model_outputs/explanations /app/Dataset_exploration/processed_data/new_orleans_model_outputs/explanations

WORKDIR /app/Demo_app
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
