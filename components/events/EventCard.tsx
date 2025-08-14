import { Event } from "@prisma/client";
import Link from "next/link";

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/event/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* TODO: Add an image here if available from sources */}
        <div className="p-6 flex-grow">
          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {new Date(event.startsAt).toLocaleString()}
          </p>
          <p className="text-gray-700 text-base mb-4 line-clamp-3">
            {event.description}
          </p>
        </div>
        <div className="px-6 pt-4 pb-2">
          {event.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
