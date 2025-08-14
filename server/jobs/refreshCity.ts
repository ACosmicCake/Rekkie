import { Worker } from 'bullmq';
import prisma from '@/lib/db';
import { TMDbAdapter } from '../adapters/tmdb';
import { MeetupAdapter } from '../adapters/meetup';
import { GenericWebAdapter } from '../adapters/generic';
import { SourceAdapter, RawEvent } from '../adapters/interface';
import { enrichEvent, EnrichedEvent } from '../llm/enrich';
import { generateEmbedding, createEventEmbeddingText } from '../llm/embed';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const adapters: SourceAdapter[] = [
  new TMDbAdapter(),
  new MeetupAdapter(),
  new GenericWebAdapter(),
];

async function processJob(city: string) {
  console.log(`[Worker] Starting refresh for city: ${city}`);
  const runId = new Date().toISOString();

  for (const adapter of adapters) {
    console.log(`[Worker] Fetching from adapter: ${adapter.name}`);
    let rawEvents: RawEvent[] = [];
    try {
      rawEvents = await adapter.fetchCity(city);
      await prisma.sourceFetchLog.create({
        data: { source: adapter.name, ok: true, tookMs: 0, runId },
      });
    } catch (error) {
      console.error(`[Worker] Error fetching from ${adapter.name}:`, error);
      await prisma.sourceFetchLog.create({
        data: { source: adapter.name, ok: false, tookMs: 0, runId, message: (error as Error).message },
      });
      continue; // Move to the next adapter
    }

    for (const rawEvent of rawEvents) {
      console.log(`[Worker] Processing event: ${rawEvent.title}`);

      const enrichedEvent = await enrichEvent(rawEvent);
      if (!enrichedEvent) {
        console.warn(`[Worker] Failed to enrich event: ${rawEvent.title}`);
        continue;
      }

      const embeddingText = createEventEmbeddingText(enrichedEvent);
      const embedding = await generateEmbedding(embeddingText);
      if (!embedding) {
        console.warn(`[Worker] Failed to generate embedding for event: ${rawEvent.title}`);
        continue;
      }

      // Upsert data into the database
      await saveEnrichedEvent(enrichedEvent, embedding, city);
    }
  }
  console.log(`[Worker] Finished refresh for city: ${city}`);
}

async function saveEnrichedEvent(event: EnrichedEvent, embedding: number[], city: string) {
  try {
    await prisma.$transaction(async (tx) => {
      let venueId: string | undefined;

      // Upsert venue
      if (event.venue?.name) {
        const existingVenue = await tx.venue.findFirst({
          where: { name: event.venue.name, city: city },
        });

        if (existingVenue) {
          venueId = existingVenue.id;
        } else {
          const newVenue = await tx.venue.create({
            data: {
              name: event.venue.name,
              address: event.venue.address,
              city: city,
              lat: event.venue.lat,
              lng: event.venue.lng,
            },
          });
          venueId = newVenue.id;
        }
      }

      // Upsert event
      await tx.event.upsert({
        where: {
          title_startsAt_venueId: {
            title: event.title,
            startsAt: new Date(event.startsAt),
            venueId: venueId || null,
          }
        },
        update: {
          description: event.description,
          tags: event.tags,
          artists: event.artists,
          sources: event.citations as any, // Prisma expects JsonValue
          embedding: embedding,
          enrichedAt: new Date(),
        },
        create: {
          title: event.title,
          startsAt: new Date(event.startsAt),
          endsAt: event.endsAt ? new Date(event.endsAt) : undefined,
          city: city,
          venueId: venueId,
          description: event.description,
          tags: event.tags,
          artists: event.artists,
          sources: event.citations as any,
          embedding: embedding,
          enrichedAt: new Date(),
        },
      });
    });
    console.log(`[DB] Successfully saved event: ${event.title}`);
  } catch (error) {
    console.error(`[DB] Error saving event "${event.title}":`, error);
  }
}


export const cityRefreshWorker = new Worker('city-refresh', async job => {
  if (job.name === 'refresh-city') {
    await processJob(job.data.city);
  }
}, { connection: redisConnection });

console.log("City refresh worker started.");
