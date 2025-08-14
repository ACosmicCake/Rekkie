import { z } from "zod";
import { SourceAdapter, RawEvent } from "./interface";

const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  release_date: z.string(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
});

const NowPlayingResponseSchema = z.object({
  results: z.array(MovieSchema),
});

export class TMDbAdapter implements SourceAdapter {
  public name = "tmdb";

  private apiKey: string;
  private baseUrl = "https://api.themoviedb.org/3";

  constructor() {
    this.apiKey = process.env.TMDB_KEY ?? "";
    if (!this.apiKey) {
      throw new Error("TMDB_KEY environment variable is not set.");
    }
  }

  async fetchCity(city: string): Promise<RawEvent[]> {
    // TMDb API doesn't filter by city directly for now_playing.
    // We fetch for a region (e.g., US) and then could filter by city if we had more location data.
    // For now, we'll just fetch popular movies in the US region.
    // A more advanced implementation could map city to a region code.
    const region = "US"; // Default to US
    const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=en-US&page=1&region=${region}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`TMDb API error: ${response.statusText}`);
        return [];
      }
      const data = await response.json();
      const parsed = NowPlayingResponseSchema.safeParse(data);

      if (!parsed.success) {
        console.error("Failed to parse TMDb response:", parsed.error);
        return [];
      }

      return parsed.data.results.map((movie): RawEvent => ({
        title: movie.title,
        startsAt: new Date(movie.release_date),
        description: movie.overview,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        source: this.name,
        rawCategory: "Movie",
        venueName: "Various Cinemas",
        city: city, // Assume the movie is available in the requested city
        artists: [], // Not applicable for movies in this context
      }));
    } catch (error) {
      console.error("Error fetching from TMDb:", error);
      return [];
    }
  }
}
