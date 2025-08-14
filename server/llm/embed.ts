import { geminiEmbedder } from "./client";
import { EnrichedEvent } from "./enrich";

/**
 * Creates a composite string from an enriched event object to be used for generating embeddings.
 * The quality of this string is crucial for the performance of the recommendation system.
 * @param event The enriched event object.
 * @returns A string containing the most relevant information about the event.
 */
export function createEventEmbeddingText(event: EnrichedEvent): string {
  const parts = [
    event.title,
    event.description,
    ...event.tags,
    ...(event.artists || []),
    ...(event.similarArtists || []),
    `Venue: ${event.venue.name}`,
    `City: ${event.city}`,
  ];
  return parts.filter(p => p).join(" | ");
}

/**
 * Generates a vector embedding for a given string of text.
 * @param text The text to embed.
 * @returns A promise that resolves to an array of numbers (the embedding), or null if an error occurs.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const result = await geminiEmbedder.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding with Gemini:", error);
    return null;
  }
}
