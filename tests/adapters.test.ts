import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TMDbAdapter } from '../server/adapters/tmdb';
import { RawEvent } from '../server/adapters/interface';

// Mock the global fetch function
global.fetch = vi.fn();

describe('TMDbAdapter', () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.resetAllMocks();
    // Setup mock environment variables
    process.env.TMDB_KEY = 'test-api-key';
  });

  it('should fetch and parse movies correctly', async () => {
    const mockApiResponse = {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'A movie for testing.',
          release_date: '2025-01-01',
          poster_path: '/test.jpg',
          vote_average: 8.5,
        },
      ],
    };

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const adapter = new TMDbAdapter();
    const events = await adapter.fetchCity('any-city');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/now_playing?api_key=test-api-key&language=en-US&page=1&region=US'
    );

    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.title).toBe('Test Movie');
    expect(event.description).toBe('A movie for testing.');
    expect(event.url).toBe('https://www.themoviedb.org/movie/1');
    expect(event.source).toBe('tmdb');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as vi.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    const adapter = new TMDbAdapter();
    const events = await adapter.fetchCity('any-city');

    expect(events).toEqual([]);
  });
});
