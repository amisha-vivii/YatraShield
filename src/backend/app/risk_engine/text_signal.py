"""Complaint-text signal using sentence embeddings.

Primary: a lightweight multilingual sentence-transformer
(paraphrase-multilingual-MiniLM-L12-v2) encodes the complaint and historical
exemplars; cosine similarity gives the text signal.

Fallback: if the model cannot be loaded (offline container, no weights cached)
a deterministic token/concept overlap similarity is used instead. The API never
crashes and never leaks a Python error to the traveller.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
_model = None
_model_failed = False


def _load_model():
    global _model, _model_failed
    if _model is not None or _model_failed:
        return _model
    try:
        from sentence_transformers import SentenceTransformer  # imported lazily

        _model = SentenceTransformer(_MODEL_NAME)
    except Exception as exc:  # noqa: BLE001 - fallback is intentional
        logger.warning("sentence-transformer unavailable, using deterministic fallback: %s", exc)
        _model_failed = True
    return _model


STOPWORDS = {
    "a", "an", "the", "for", "to", "from", "of", "and", "or", "was", "were", "is",
    "are", "be", "my", "our", "we", "i", "at", "on", "in", "that", "this", "with",
    "after", "before", "me", "us", "as", "so", "but", "not", "no", "did", "had",
}


def _tokens(text: str) -> set[str]:
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return {t for t in cleaned.split() if len(t) > 1 and t not in STOPWORDS}


def _fallback_similarity(text: str, exemplar: str) -> float:
    a, b = _tokens(text), _tokens(exemplar)
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b) ** 0.5


@dataclass
class TextSignal:
    pattern: str
    category: str
    similarity: float
    score: int
    model: str


def score_text(description: str, patterns: list[dict]) -> TextSignal | None:
    """Compare complaint text with historical complaint patterns."""
    if not description or len(description.strip()) < 9 or not patterns:
        return None

    model = _load_model()
    best: tuple[float, dict] | None = None

    if model is not None:
        from sentence_transformers import util

        query_vec = model.encode(description, convert_to_tensor=True, normalize_embeddings=True)
        for pattern in patterns:
            exemplar_vecs = model.encode(
                pattern["exemplars"], convert_to_tensor=True, normalize_embeddings=True
            )
            sims = util.cos_sim(query_vec, exemplar_vecs)[0]
            value = float(0.7 * sims.max() + 0.3 * sims.mean())
            if best is None or value > best[0]:
                best = (value, pattern)
        model_name = _MODEL_NAME
    else:
        for pattern in patterns:
            sims = [_fallback_similarity(description, e) for e in pattern["exemplars"]]
            value = 0.7 * max(sims) + 0.3 * (sum(sims) / len(sims))
            if best is None or value > best[0]:
                best = (value, pattern)
        model_name = "deterministic-fallback"

    similarity, pattern = best  # type: ignore[misc]
    similarity = max(0.0, min(1.0, similarity))
    return TextSignal(
        pattern=pattern["label"],
        category=pattern["category"],
        similarity=similarity,
        score=int(round(min(100.0, similarity * 100 * 0.87))),
        model=model_name,
    )
