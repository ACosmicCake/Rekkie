'use client';

import React from 'react';

type EventCardProps = {
  name: string;
  description: string;
  startTime: string;
  locationName: string;
  city: string;
  imageUrl?: string | null;
  ticketLink?: string | null;
};

const EventCard: React.FC<EventCardProps> = ({
  name,
  description,
  startTime,
  locationName,
  city,
  imageUrl,
  ticketLink,
}) => {
  const formattedDate = new Date(startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white m-4">
      {imageUrl && <img className="w-full h-48 object-cover" src={imageUrl} alt={name} />}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-black">{name}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <p className="text-gray-600 text-sm">{formattedDate}</p>
        <p className="text-gray-600 text-sm">{locationName}, {city}</p>
      </div>
      {ticketLink && (
        <div className="px-6 py-4">
          <a
            href={ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get Tickets
          </a>
        </div>
      )}
    </div>
  );
};

export default EventCard;
