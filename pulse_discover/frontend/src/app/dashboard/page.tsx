"use client";

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import { Event } from '@/types';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy user ID - replace with actual logged-in user logic
  const DUMMY_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:8000/events/recommendations/${DUMMY_USER_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading events...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;
  }

  const handleDismiss = (eventId: string) => {
    setEvents(events.filter(event => event.event_id !== eventId));
  };

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    let filtered = events;

    if (dateFilter) {
        filtered = filtered.filter(event => new Date(event.start_time).toLocaleDateString().includes(dateFilter));
    }

    if (locationFilter) {
        filtered = filtered.filter(event => event.city.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    setFilteredEvents(filtered);
  }, [events, dateFilter, locationFilter]);


  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Recommended Events</h1>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Filter Events</h2>
        <div className="flex gap-4">
            <input
                type="text"
                placeholder="Filter by date (e.g., MM/DD/YYYY)"
                className="input input-bordered w-full"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
            />
            <input
                type="text"
                placeholder="Filter by city"
                className="input input-bordered w-full"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.event_id} event={event} onDismiss={handleDismiss} />
        ))}
      </div>
    </main>
  );
}
