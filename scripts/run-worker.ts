// This script starts the BullMQ worker process.
// In a real application, you would run this as a separate process on your server.
// e.g., `node -r ts-node/register scripts/run-worker.ts`

import { cityRefreshWorker } from '../server/jobs/refreshCity';

console.log('Starting BullMQ worker...');

// The worker is already started in refreshCity.ts,
// so just importing it is enough to get it running.
// We can add error handling and graceful shutdown logic here.

cityRefreshWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

cityRefreshWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

process.on('SIGINT', async () => {
    console.log('Gracefully shutting down worker...');
    await cityRefreshWorker.close();
    process.exit(0);
});
