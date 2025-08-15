import { render, screen } from '@testing-library/react';
import EventCard from './EventCard';
import { Event } from '@/lib/types';

const mockEvent: Event = {
  event_id: 'evt-123',
  title: 'Test Event',
  venue: {
    venue_id: 'ven-456',
    name: 'Test Venue',
    city: 'Testville',
    country: 'Testland',
    sources: [],
  },
  showtimes: [{ start: '2025-09-01T20:00:00', timezone: 'Europe/Berlin' }],
  external_ids: [],
  description: 'A test event',
  categories: ['test'],
  tags: ['test'],
  artists: ['Test Artist'],
  related_entities: [],
  city: 'Testville',
  country: 'Testland',
  images: [],
  sources: [],
  discovered_at: '2025-08-15T12:00:00Z',
  last_verified_at: '2025-08-15T12:00:00Z',
  canonical_fingerprint: 'test-event-fingerprint',
  quality_score: 0.9,
};

describe('EventCard', () => {
  it('renders the event title', () => {
    render(<EventCard event={mockEvent} />);
    const title = screen.getByText('Test Event');
    expect(title).toBeInTheDocument();
  });

  it('renders the venue name', () => {
    render(<EventCard event={mockEvent} />);
    const venue = screen.getByText('Test Venue');
    expect(venue).toBeInTheDocument();
  });
});
