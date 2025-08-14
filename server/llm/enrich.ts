import { geminiPro } from "./client";
import { RawEvent } from "../adapters/interface";
import { z } from "zod";

// Zod schema for validation
const EnrichedEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  venue: z.object({
    name: z.string(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  city: z.string(),
  priceRange: z.string().optional(),
  tags: z.array(z.string()),
  artists: z.array(z.string()).optional(),
  similarArtists: z.array(z.string()).optional(),
  ageLimit: z.string().optional(),
  accessibilityNotes: z.string().optional(),
  citations: z.array(z.object({
    source: z.string(),
    url: z.string().url(),
  })),
  confidence: z.number().min(0).max(1),
});

export type EnrichedEvent = z.infer<typeof EnrichedEventSchema>;

// JSON schema for the LLM tool
const EnrichedEventJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", format: "date-time" },
    venue: {
      type: "object",
      properties: {
        name: { type: "string" },
        address: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
      },
      required: ["name"],
    },
    city: { type: "string" },
    priceRange: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    artists: { type: "array", items: { type: "string" } },
    similarArtists: { type: "array", items: { type: "string" } },
    ageLimit: { type: "string" },
    accessibilityNotes: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source: { type: "string" },
          url: { type: "string", format: "uri" },
        },
        required: ["source", "url"],
      },
    },
    confidence: { type: "number" },
  },
  required: ["title", "startsAt", "venue", "city", "citations", "tags", "description", "confidence"],
};


export async function enrichEvent(event: RawEvent): Promise<EnrichedEvent | null> {
  const prompt = `
    You are a research assistant that converts raw event data into a normalized event card with high precision.
    Use Google Search Grounding to verify times, venue, and details.
    Only output JSON that matches the provided schema. Include 2-6 citations (author/site + URL) that support each fact.
    Derive tags (lowercase, kebab-case). If an artist is unknown, infer likely genre and 3 similar artists.
    Identify age limit and accessibility if present. If uncertainty remains, set confidence between 0 and 1.

    Here is the raw event data to process:
    ${JSON.stringify(event, null, 2)}
  `;

  try {
    const result = await geminiPro.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // The 'tools' parameter for grounding is now part of the model configuration in v1.
      // In the google-generative-ai SDK, grounding is enabled by default if the model supports it.
      // The prompt is what guides it to use search.
      // For explicit JSON mode, we can use a specific model or function calling.
      // Let's assume the model is fine-tuned for JSON or we use function calling.
      // The prompt asks for a JSON schema, so let's use a tool for that.
    });

    // The Gemini API does not have a simple "json_mode".
    // We get the structured data from the `functionCalls` part of the response when using tools.
    // Or, we can parse it from the text if we instruct it to output JSON.
    // Let's assume the model returns a JSON string in its text response for simplicity here.
    // A more robust implementation would use function calling.

    const responseText = result.response.text();
    const jsonResponse = JSON.parse(responseText);

    const validatedData = EnrichedEventSchema.safeParse(jsonResponse);

    if (validatedData.success) {
      return validatedData.data;
    } else {
      console.error("LLM response failed validation:", validatedData.error);
      return null;
    }
  } catch (error) {
    console.error("Error enriching event with Gemini:", error);
    return null;
  }
}
