"use client";

import { useEffect, useState } from "react";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Placeholder data
const sampleEvent: Event = {
  event_id: "1",
  name: "Tech Conference 2025",
  description:
    "The biggest tech conference in the world. Join us for three days of talks, workshops, and networking with the best minds in the industry. We will have speakers from all the major tech companies, as well as startups and academia. This is an event you don't want to miss!",
  start_time: "2025-10-20T09:00:00Z",
  end_time: "2025-10-22T17:00:00Z",
  location_name: "Moscone Center",
  address: "747 Howard St",
  city: "San Francisco, CA",
  image_url: "https://via.placeholder.com/1200x400",
  ticket_link: "#",
  category: "Tech",
  event_type: "Conference",
  created_at: "2024-01-01T00:00:00Z",
};

export default function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the event data from an API
    // For now, we'll use the sample data
    setEvent(sampleEvent);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image
          src={event.image_url || "https://via.placeholder.com/1200x400"}
          alt={event.name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 text-muted-foreground">
          <p>
            {new Date(event.start_time).toLocaleString()} -{" "}
            {event.end_time && new Date(event.end_time).toLocaleString()}
          </p>
          <p>
            {event.location_name}, {event.city}
          </p>
        </div>
        <p className="text-lg mb-8">{event.description}</p>
        <div className="flex justify-center">
          <Button size="lg">RSVP for this Event</Button>
        </div>
      </div>
    </div>
  );
}
