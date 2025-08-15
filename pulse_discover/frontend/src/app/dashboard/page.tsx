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


  const [wildcardEvents, setWildcardEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchWildcardEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events/wildcard');
        if (!response.ok) {
          throw new Error('Failed to fetch wildcard events');
        }
        const data = await response.json();
        setWildcardEvents(data);
      } catch (err: any) {
        // Not showing this error in the main error state
        // as it's a non-critical part of the page.
        console.error(err);
      }
    };

    fetchWildcardEvents();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) {
          setIsSearching(false);
          return;
      }

      setIsSearching(true);
      setLoading(true);
      try {
          const response = await fetch(`http://localhost:8000/events/search?q=${encodeURIComponent(searchQuery)}`);
          if (!response.ok) {
              throw new Error('Search failed');
          }
          const data = await response.json();
          setSearchResults(data);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search for events by name, type, or description..."
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {isSearching ? (
        <div>
          <h1 className="text-3xl font-bold mb-6">Search Results</h1>
           {loading ? <p>Searching...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((event) => (
                <EventCard key={`search-${event.event_id}`} event={event} onDismiss={() => {}} />
              ))}
            </div>
           )}
           {searchResults.length === 0 && !loading && <p>No events found for your search.</p>}
        </div>
      ) : (
        <>
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

          {wildcardEvents.length > 0 && (
              <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4 text-center">Discovery Zone</h2>
                  <p className="text-center text-gray-600 mb-6">Expand your horizons with these randomly selected events!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wildcardEvents.map((event) => (
                          <EventCard key={`wildcard-${event.event_id}`} event={event} onDismiss={() => {}} />
                      ))}
                  </div>
              </div>
          )}
        </>
      )}
    </main>
  );
}
