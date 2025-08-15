from backend.utils.deduplication import generate_canonical_fingerprint

def test_generate_canonical_fingerprint():
    """
    Tests the generation of a canonical fingerprint for an event.
    """
    fingerprint = generate_canonical_fingerprint(
        title="Awesome Concert",
        primary_artist="The Cool Band",
        venue_name="The Great Venue",
        first_showtime_start="2025-08-15T20:00:00",
        city="Berlin",
    )
    assert fingerprint == "awesome-concert-the-cool-band-the-great-venue-2025-08-15t200000-berlin"

def test_generate_canonical_fingerprint_with_special_chars():
    """
    Tests the generation of a canonical fingerprint with special characters in the input.
    """
    fingerprint = generate_canonical_fingerprint(
        title="Event with & special chars!",
        primary_artist="Artist (feat. guest)",
        venue_name="Venue @ The Corner",
        first_showtime_start="2025-08-15T20:00:00",
        city="New York",
    )
    assert fingerprint == "event-with-special-chars-artist-feat-guest-venue-the-corner-2025-08-15t200000-new-york"
