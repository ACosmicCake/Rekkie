"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCard } from "@/components/EventCard"; // This will be refactored
import { Event } from "@/types";

// Placeholder data
const sampleEvents: Event[] = [
  {
    event_id: "1",
    name: "Tech Conference 2025",
    description: "The biggest tech conference in the world.",
    start_time: "2025-10-20T09:00:00Z",
    end_time: "2025-10-22T17:00:00Z",
    location_name: "San Francisco, CA",
    image_url: "https://via.placeholder.com/400x200",
    ticket_link: "#",
    category: "Tech",
  },
  {
    event_id: "2",
    name: "Summer Music Festival",
    description: "Three days of live music from your favorite artists.",
    start_time: "2025-08-15T12:00:00Z",
    end_time: "2025-08-17T23:00:00Z",
    location_name: "New York, NY",
    image_url: "https://via.placeholder.com/400x200",
    ticket_link: "#",
    category: "Music",
  },
  {
    event_id: "3",
    name: "Art Basel Miami",
    description: "The leading art show in the Americas.",
    start_time: "2025-12-04T11:00:00Z",
    end_time: "2025-12-07T20:00:00Z",
    location_name: "Miami, FL",
    image_url: "https://via.placeholder.com/400x200",
    ticket_link: "#",
    category: "Art",
  },
];

import { getEvents } from "@/lib/api";
import { useEffect } from "react";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  // Filtering and sorting logic will be implemented here
  const filteredEvents = (events.length > 0 ? events : sampleEvents).filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (category === "all" || event.category === category)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <Input
          placeholder="Search events..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Music">Music</SelectItem>
              <SelectItem value="Tech">Tech</SelectItem>
              <SelectItem value="Art">Art</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
