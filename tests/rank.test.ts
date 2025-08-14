import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../lib/db';
import { getPersonalizedEvents, getWildcardEvents } from '../server/rank/rank';

vi.mock('../lib/db', () => ({
  default: {
    userPreference: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

describe('Ranking Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getPersonalizedEvents', () => {
    it('should return events sorted by similarity for a user with preferences', async () => {
      // Mock user preferences
      (prisma.userPreference.findMany as vi.Mock).mockResolvedValue([
        { embedding: [1, 0, 0] },
        { embedding: [0, 1, 0] },
      ]);

      // Mock events returned from similarity search
      const mockEvents = [
        { id: 'event1', title: 'Event 1', embedding: [0.9, 0.1, 0] }, // Most similar
        { id: 'event2', title: 'Event 2', embedding: [0.1, 0.9, 0] }, // Also similar
        { id: 'event3', title: 'Event 3', embedding: [0, 0, 1] },   // Least similar
      ];
      (prisma.$queryRaw as vi.Mock).mockResolvedValue(mockEvents);

      const events = await getPersonalizedEvents('test-user-id');

      expect(prisma.userPreference.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', embedding: { not: null } },
        select: { embedding: true },
      });

      // The composite vector should be [0.5, 0.5, 0]
      // The test should check that the query was called with this vector
      const expectedVector = '[0.5,0.5,0]';
      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.anything(), // The raw query string
        expectedVector + '::vector'
      );

      // We expect the mock events to be returned as is, since we mock the DB call
      expect(events).toEqual(mockEvents);
    });

    it('should return default recent events for a user with no preferences', async () => {
      (prisma.userPreference.findMany as vi.Mock).mockResolvedValue([]);
      const mockRecentEvents = [{ id: 'event4', title: 'Recent Event' }];
      (prisma.event.findMany as vi.Mock).mockResolvedValue(mockRecentEvents);

      const events = await getPersonalizedEvents('new-user-id');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      expect(events).toEqual(mockRecentEvents);
    });
  });

  // TODO: Add tests for getWildcardEvents
});
