"use client";

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import { Event } from '@/types';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [wildcardEvents, setWildcardEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          // Redirect to login or handle not-logged-in state
          return;
        }
        const response = await fetch(`http://localhost:8000/events/recommendations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
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

    const fetchWildcardEvents = async () => {
        try {
            const response = await fetch(`http://localhost:8000/events/wildcard`);
            if (!response.ok) {
                throw new Error('Failed to fetch wildcard events');
            }
            const data = await response.json();
            setWildcardEvents(data);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    fetchEvents();
    fetchWildcardEvents();
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

  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = async () => {
    const query = new URLSearchParams();
    if (searchKeyword.length >= 2) query.append('keyword', searchKeyword);
    if (searchLocation) query.append('location', searchLocation);

    // Only search if there is some criteria
    if (Array.from(query.keys()).length === 0) {
        setSearchResults([]);
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/events/search?${query.toString()}`);
        if (!response.ok) {
            throw new Error('Search failed');
        }
        const data = await response.json();
        setSearchResults(data);
    } catch (err: any) {
        console.error(err.message);
    }
  };

  // Effect to trigger search when typing stops
  useEffect(() => {
    const handler = setTimeout(() => {
        handleSearch();
    }, 500); // Debounce search by 500ms

    return () => {
        clearTimeout(handler);
    };
  }, [searchKeyword, searchLocation]);


  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Recommended Events</h1>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Search Events</h2>
        <div className="flex gap-4">
            <input
                type="text"
                placeholder="Search by keyword..."
                className="input input-bordered w-full"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
            />
            <input
                type="text"
                placeholder="Search by city..."
                className="input input-bordered w-full"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(searchResults.length > 0 ? searchResults : events).map((event) => (
          <EventCard key={event.event_id} event={event} onDismiss={handleDismiss} />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Discover New Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wildcardEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
