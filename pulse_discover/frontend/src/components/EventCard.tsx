import { Event } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  onDismiss?: (eventId: string) => void;
}

export default function EventCard({ event, onDismiss }: EventCardProps) {
  const [isInteracted, setIsInteracted] = useState(false);

  const handleInteraction = async (interactionType: 'saved' | 'dismissed') => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/interactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.event_id,
          interaction_type: interactionType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record ${interactionType} interaction`);
      }

      setIsInteracted(true);

      if (interactionType === 'dismissed' && onDismiss) {
        onDismiss(event.event_id);
      }
      // You could add visual feedback for 'saved' as well
    } catch (error) {
      console.error(error);
      // Handle error state in UI
    }
  };

  if (isInteracted) {
      // Optionally, you can render nothing or a "Dismissed" message
      return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
      {event.image_url && (
        <Image
          src={event.image_url}
          alt={event.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-2 text-sm">{new Date(event.start_time).toLocaleString()}</p>
        <p className="text-gray-700 mb-4 flex-grow">{event.description}</p>
        <div className="flex justify-between items-center mt-4">
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
       <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
            <button onClick={() => handleInteraction('saved')} className="btn btn-sm btn-success">Save</button>
            <button onClick={() => handleInteraction('dismissed')} className="btn btn-sm btn-error">Dismiss</button>
        </div>
    </div>
  );
}
