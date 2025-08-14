// This script adds a city to the refresh queue.
// Usage: `node -r ts-node/register scripts/schedule-refresh.ts "San Francisco"`

import { addCityToQueue, cityRefreshQueue } from '../server/jobs/queue';

async function main() {
  const city = process.argv[2];

  if (!city) {
    console.error('Please provide a city name as an argument.');
    process.exit(1);
  }

  await addCityToQueue(city);

  console.log('Job scheduled successfully. Closing queue connection.');
  await cityRefreshQueue.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
