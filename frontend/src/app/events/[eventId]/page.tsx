import { getEvent } from '@/lib/api';

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = await getEvent(params.eventId);

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-xl text-gray-600 mb-4">{event.venue.name}</p>

      <div className="prose max-w-none">
        <p>{event.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Showtimes</h2>
        <ul>
          {event.showtimes.map((showtime) => (
            <li key={showtime.start}>
              {new Date(showtime.start).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
