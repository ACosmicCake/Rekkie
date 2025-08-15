export interface SourceDoc {
  url: string;
  title?: string;
  snippet?: string;
  fetched_at: string;
  confidence: number;
}

export interface Venue {
  venue_id: string;
  name: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  geohash?: string;
  sources: SourceDoc[];
}

export interface Showtime {
  start: string;
  end?: string;
  timezone: string;
}

export interface TicketInfo {
  currency?: string;
  min_price?: number;
  max_price?: number;
  availability?: 'available' | 'limited' | 'sold_out' | 'unknown';
  purchase_url?: string;
  rating_at_showtime?: number;
}

export interface Event {
  event_id: string;
  external_ids: string[];
  title: string;
  description?: string;
  categories: string[];
  tags: string[];
  artists: string[];
  related_entities: string[];
  city: string;
  country: string;
  venue: Venue;
  showtimes: Showtime[];
  ticket?: TicketInfo;
  images: string[];
  sources: SourceDoc[];
  discovered_at: string;
  last_verified_at: string;
  canonical_fingerprint: string;
  quality_score: number;
}

export interface WildcardSuggestion {
  event: Event;
  rationale: string;
}

export interface Preference {
  user_id: string;
  liked_genres: string[];
  liked_artists: string[];
  liked_venues: string[];
  disliked_artists: string[];
  disliked_venues: string[];
  neighborhoods: string[];
  price_ceiling?: number;
  time_windows: string[];
  blacklist_terms: string[];
}

export interface User {
  user_id: string;
  email: string;
}

export interface UserCreate extends User {
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
}
