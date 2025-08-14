import { z } from "zod";
import { SourceAdapter, RawEvent } from "./interface";

const MeetupEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  dateTime: z.string(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  eventUrl: z.string().url(),
  group: z.object({
    name: z.string(),
    city: z.string(),
  }),
  venue: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
  }).optional(),
});

const MeetupResponseSchema = z.object({
  nodes: z.array(MeetupEventSchema),
});

export class MeetupAdapter implements SourceAdapter {
  public name = "meetup";
  private baseUrl = "https://api.meetup.com/find/upcoming_events";
  // Meetup's API is a bit tricky. The public REST API is deprecated.
  // The GraphQL API is the way to go, but requires OAuth2.
  // For server-to-server, one might use a legacy API key with the REST API.
  // Let's simulate a call to a simplified REST endpoint for this exercise.
  // In a real app, a proper GraphQL client with OAuth2 would be needed.

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MEETUP_KEY ?? "";
    if (!this.apiKey) {
      // In a real app, you might not want to throw an error,
      // but rather log a warning and disable the adapter.
      console.warn("MEETUP_KEY environment variable is not set. MeetupAdapter will be disabled.");
    }
  }

  async fetchCity(city: string): Promise<RawEvent[]> {
    if (!this.apiKey) return [];

    // This is a simplified, hypothetical endpoint.
    // The real API is more complex.
    const url = `${this.baseUrl}?text=${encodeURIComponent(city)}&key=${this.apiKey}`;

    // As the public API is deprecated, I will return mock data for now.
    // This allows me to build and test the rest of the pipeline.
    // In a real-world scenario, I would implement the full GraphQL OAuth flow.
    return this.getMockData(city);
  }

  private getMockData(city: string): RawEvent[] {
    console.log(`[MeetupAdapter] Using mock data for city: ${city}`);
    return [
      {
        title: "Tech Innovators Meetup",
        startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        venueName: "Innovation Hub",
        address: "123 Tech Street",
        city: city,
        url: "https://www.meetup.com/mock-event-1",
        source: this.name,
        rawCategory: "Technology",
        description: "Join us to discuss the latest in AI and Web3.",
      },
      {
        title: "Downtown Chess Club Weekly Meetup",
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        venueName: "The Corner Cafe",
        address: "456 Main Avenue",
        city: city,
        url: "https://www.meetup.com/mock-event-2",
        source: this.name,
        rawCategory: "Hobbies",
        description: "All skill levels welcome for an evening of chess.",
      },
    ];
  }
}
