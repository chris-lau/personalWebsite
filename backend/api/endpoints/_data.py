"""Shared data-loading utilities for JSON-backed endpoints.

Provides cached reads of static JSON data files and markdown posts so that
endpoints do not re-read / re-parse from disk on every request.
"""

import functools
import json
from pathlib import Path
from typing import Any, Optional

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
POSTS_DIR = Path(__file__).resolve().parent.parent.parent / "posts"


@functools.lru_cache(maxsize=32)
def load_json(filename: str) -> Any:
    """Load and cache a JSON file from the ``data/`` directory.

    Results are memoized for the lifetime of the process (safe because the
    data files are static at runtime).
    """
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {filename}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def find_by(items: list, value: str, key: str = "id") -> Optional[dict]:
    """Linear search for an item whose ``key`` matches ``value``."""
    return next((item for item in items if item.get(key) == value), None)
