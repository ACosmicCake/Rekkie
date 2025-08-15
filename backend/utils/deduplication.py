import re


def slugify(text: str) -> str:
    """
    Simple slugify function that lowercases, removes special characters,
    and replaces spaces with hyphens.
    """
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return text


def generate_canonical_fingerprint(
    title: str,
    primary_artist: str,
    venue_name: str,
    first_showtime_start: str,
    city: str,
) -> str:
    """
    Generates a canonical fingerprint for an event to be used for deduplication.
    """
    raw_string = f"{title}-{primary_artist}-{venue_name}-{first_showtime_start}-{city}"
    return slugify(raw_string)
