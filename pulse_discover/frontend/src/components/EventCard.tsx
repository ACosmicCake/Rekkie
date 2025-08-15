import { Event } from '@/types';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {event.image_url && (
        <Image
          src={event.image_url}
          alt={event.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-2">{new Date(event.start_time).toLocaleString()}</p>
        <p className="text-gray-700 mb-4">{event.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{event.location_name}</span>
          <a
            href={event.ticket_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Get Tickets
          </a>
        </div>
      </div>
    </div>
  );
}
