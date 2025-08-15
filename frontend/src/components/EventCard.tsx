import { Event } from '@/lib/types';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <Link href={`/events/${event.event_id}`}>
        <h2 className="text-xl font-bold">{event.title}</h2>
      </Link>
      <p className="text-gray-600">{event.venue.name}</p>
      <p className="text-gray-800">{new Date(event.showtimes[0].start).toLocaleString()}</p>
    </div>
  );
}
