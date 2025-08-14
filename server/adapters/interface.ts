export interface RawEvent {
  title: string;
  startsAt: Date;
  endsAt?: Date;
  venueName?: string;
  address?: string;
  city?: string;
  price?: string;
  url: string;
  source: string; // The name of the adapter
  rawCategory?: string;
  artists?: string[];
  description?: string;
}

export interface SourceAdapter {
  name: string;
  fetchCity(city: string): Promise<RawEvent[]>;
}
