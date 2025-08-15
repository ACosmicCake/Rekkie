import { getEvents, getRecommendations } from '@/lib/api';
import EventCard from '@/components/EventCard';

export default async function HomePage() {
  const events = await getEvents();
  const recommendedEvents = await getRecommendations("user-123"); // Hardcoded user_id

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Recommended for you</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {recommendedEvents.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-4">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>
    </main>
  );
}
