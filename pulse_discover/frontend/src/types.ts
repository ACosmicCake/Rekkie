export interface Event {
  event_id: string;
  name: string;
  description: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  ticket_price_min?: number;
  ticket_price_max?: number;
  ticket_link?: string;
  image_url?: string;
  event_type: string;
  source_urls?: string[];
  raw_json_data?: any;
  created_at: string;
  updated_at?: string;
}
