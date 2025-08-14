import prisma from '@/lib/db';
import { Event } from '@prisma/client';

const WEIGHTS = {
  SIMILARITY: 0.45,
  RECENCY: 0.2,
  PRICE_FIT: 0.1,
  POPULARITY: 0.1,
  VENUE_AFFINITY: 0.1,
  DIVERSITY_BOOST: 0.05,
};

/**
 * Calculates the user's composite preference vector by averaging the embeddings of their preferences.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user's composite vector, or null if they have no preferences.
 */
async function getUserCompositeVector(userId: string): Promise<number[] | null> {
  const preferences = await prisma.userPreference.findMany({
    where: { userId, embedding: { not: null } },
    select: { embedding: true },
  });

  if (preferences.length === 0) {
    return null;
  }

  const embeddings = preferences.map(p => p.embedding as unknown as number[]);
  const vectorLength = embeddings[0].length;
  const compositeVector = new Array(vectorLength).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < vectorLength; i++) {
      compositeVector[i] += embedding[i];
    }
  }

  return compositeVector.map(v => v / embeddings.length);
}

/**
 * Fetches events from the database, ordered by cosine similarity to the user's vector.
 * @param userVector The user's composite preference vector.
 * @param limit The maximum number of events to fetch.
 * @returns A promise that resolves to a list of events.
 */
async function getSimilarEvents(userVector: number[], limit: number = 100): Promise<Event[]> {
  const vectorString = `[${userVector.join(',')}]`;

  // Using Prisma's raw query capabilities for pgvector
  // The `<=>` operator calculates the cosine distance (1 - cosine_similarity)
  const events = await prisma.$queryRaw<Event[]>`
    SELECT *
    FROM "Event"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vectorString}::vector
    LIMIT ${limit};
  `;

  return events;
}

/**
 * Gets a list of personalized events for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to a ranked list of events.
 */
export async function getPersonalizedEvents(userId: string): Promise<Event[]> {
  const userVector = await getUserCompositeVector(userId);

  if (!userVector) {
    // If user has no preferences, return a default list (e.g., most recent)
    return prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  const similarEvents = await getSimilarEvents(userVector, 100);

  // TODO: In a real app, calculate the full weighted score here.
  // This would involve fetching user profile for budget, favorite venues, etc.
  // and normalizing scores for recency, popularity, etc.
  // For now, we'll just return the events sorted by similarity.

  return similarEvents;
}


/**
 * Gets a list of "wildcard" events that are intentionally outside the user's usual tastes.
 * @param userId The ID of the user.
 * @returns A promise that resolves to a list of wildcard events.
 */
export async function getWildcardEvents(userId: string): Promise<Event[]> {
    const userVector = await getUserCompositeVector(userId);

    if (!userVector) {
        // If no user preferences, we can't determine what's a "wildcard".
        // Return a random set of popular events.
        const allEvents = await prisma.event.findMany({ take: 100, where: { rating: { gte: 7 } } });
        return allEvents.sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    const vectorString = `[${userVector.join(',')}]`;

    // Fetch events that are *least* similar (highest cosine distance)
    // and have a decent rating.
    const events = await prisma.$queryRaw<Event[]>`
      SELECT *
      FROM "Event"
      WHERE "embedding" IS NOT NULL AND "rating" > 6
      ORDER BY "embedding" <=> ${vectorString}::vector DESC
      LIMIT 20;
    `;

    // Return a random sample of these dissimilar events
    return events.sort(() => 0.5 - Math.random()).slice(0, 5);
}
