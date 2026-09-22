import os

LOCAL_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)


def cors_origins() -> list[str]:
    origins = list(LOCAL_ORIGINS)
    extra = os.environ.get("CORS_ORIGINS", "")
    for item in extra.split(","):
        origin = item.strip().rstrip("/")
        if origin and origin not in origins:
            origins.append(origin)
    return origins


def cors_origin_regex() -> str | None:
    configured = os.environ.get("CORS_ORIGIN_REGEX")
    if configured is None:
        return r"https://.*\.vercel\.app"
    stripped = configured.strip()
    return stripped or None
