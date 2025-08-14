import { NextResponse } from 'next/server';
import { addCityToQueue } from '@/server/jobs/queue';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // In a real app, you might fetch this list from your database
  const citiesToRefresh = [
    "San Francisco",
    "New York",
    "London",
    "Tokyo",
  ];

  try {
    for (const city of citiesToRefresh) {
      await addCityToQueue(city);
    }
    return NextResponse.json({ success: true, message: `Scheduled refresh for ${citiesToRefresh.length} cities.` });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ success: false, message: "Failed to schedule jobs." }, { status: 500 });
  }
}
