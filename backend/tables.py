import sqlalchemy as sa
from .database import Base


class Event(Base):
    __tablename__ = "events"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    event_id = sa.Column(sa.String, unique=True, index=True, nullable=False)
    external_ids = sa.Column(sa.JSON, default=[])
    title = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.Text)
    categories = sa.Column(sa.JSON, default=[])
    tags = sa.Column(sa.JSON, default=[])
    artists = sa.Column(sa.JSON, default=[])
    related_entities = sa.Column(sa.JSON, default=[])
    city = sa.Column(sa.String, nullable=False)
    country = sa.Column(sa.String, nullable=False)
    venue = sa.Column(sa.JSON, default={})
    showtimes = sa.Column(sa.JSON, default=[])
    ticket = sa.Column(sa.JSON, default={})
    images = sa.Column(sa.JSON, default=[])
    sources = sa.Column(sa.JSON, default=[])
    discovered_at = sa.Column(sa.DateTime, nullable=False)
    last_verified_at = sa.Column(sa.DateTime, nullable=False)
    canonical_fingerprint = sa.Column(sa.String, unique=True, nullable=False)
    quality_score = sa.Column(sa.Float, nullable=False)
    # Unique constraint for the write-ahead guard
    __table_args__ = (
        sa.UniqueConstraint('city', 'canonical_fingerprint', name='_city_fingerprint_uc'),
    )


class Venue(Base):
    __tablename__ = "venues"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    venue_id = sa.Column(sa.String, unique=True, index=True, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    address = sa.Column(sa.String)
    city = sa.Column(sa.String, nullable=False)
    country = sa.Column(sa.String, nullable=False)
    latitude = sa.Column(sa.Float)
    longitude = sa.Column(sa.Float)
    geohash = sa.Column(sa.String)
    sources = sa.Column(sa.JSON, default=[])


class User(Base):
    __tablename__ = "users"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    user_id = sa.Column(sa.String, unique=True, index=True, nullable=False)
    email = sa.Column(sa.String, unique=True, index=True, nullable=False)
    hashed_password = sa.Column(sa.String, nullable=False)


class Preference(Base):
    __tablename__ = "preferences"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    user_id = sa.Column(sa.String, sa.ForeignKey("users.user_id"), nullable=False, unique=True)
    liked_genres = sa.Column(sa.JSON, default=[])
    liked_artists = sa.Column(sa.JSON, default=[])
    liked_venues = sa.Column(sa.JSON, default=[])
    disliked_artists = sa.Column(sa.JSON, default=[])
    disliked_venues = sa.Column(sa.JSON, default=[])
    neighborhoods = sa.Column(sa.JSON, default=[])
    price_ceiling = sa.Column(sa.Float)
    time_windows = sa.Column(sa.JSON, default=[])
    blacklist_terms = sa.Column(sa.JSON, default=[])


class Interaction(Base):
    __tablename__ = "interactions"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    user_id = sa.Column(sa.String, sa.ForeignKey("users.user_id"), nullable=False)
    event_id = sa.Column(sa.String, sa.ForeignKey("events.event_id"), nullable=False)
    action = sa.Column(sa.String, nullable=False)
    ts = sa.Column(sa.DateTime, nullable=False)
