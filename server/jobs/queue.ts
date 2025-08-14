import { Queue } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const cityRefreshQueue = new Queue('city-refresh', {
  connection: redisConnection,
});

export async function addCityToQueue(city: string) {
  await cityRefreshQueue.add('refresh-city', { city });
  console.log(`Added city "${city}" to the refresh queue.`);
}
