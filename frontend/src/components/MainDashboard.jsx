import React, { useState, useEffect, useCallback } from 'react';
import EventCard from './EventCard';
import FilterBar from './FilterBar';
import * as api from '../services/api';

const MainDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const fetchedEvents = await api.getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      setError('Failed to fetch events.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = async () => {
    try {
      setError('');
      setIsLoading(true);
      const newRecommendations = await api.refreshRecommendations();
      // Add new events to the top, or simply refetch all
      console.log('New recommendations:', newRecommendations);
      await fetchEvents(); // Refetch all events to show the new ones
    } catch (err) {
      setError('Failed to refresh recommendations.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (eventId, status) => {
    try {
      await api.createInteraction({ event_id: eventId, status });
      // Remove the interacted event from the view for immediate feedback
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error('Failed to record interaction:', err);
      // Optionally show an error to the user
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Event Recommendations</h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Recommendations'}
          </button>
        </div>

        <FilterBar />

        {error && <p className="text-center text-red-500">{error}</p>}

        {isLoading && events.length === 0 ? (
          <p className="text-center text-gray-500">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onInteract={handleInteraction} />
            ))}
          </div>
        )}
        {!isLoading && events.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-10">
            No events found. Try refreshing your recommendations!
          </p>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
