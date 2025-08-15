import React, { useState } from 'react';

const EventCard = ({ event, onInteract }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    onInteract(event.id, 'SAVED');
  };

  const handleDislike = () => {
    onInteract(event.id, 'DISLIKED');
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
      {event.is_wildcard && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          ✨ Wildcard
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
        <p className="text-sm font-semibold text-gray-600 mb-1">{event.venue_name}</p>
        <p className="text-sm text-gray-500 mb-4">{new Date(event.start_time).toLocaleString()}</p>

        <p className="text-gray-700 mb-4">{event.description}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
            {event.category_llm}
          </span>
          <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
            Source
          </a>
        </div>

        {event.details && (
          <div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-gray-600 hover:underline mb-2">
              {isExpanded ? 'Hide' : 'Show'} Details
            </button>
            {isExpanded && (
              <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-800">
                <pre>{JSON.stringify(event.details, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleDislike}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Not for me 👎
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Save ⭐
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
