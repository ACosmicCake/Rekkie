"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Event } from "@/types";

// Placeholder data
const user = {
  username: "testuser",
  email: "test@example.com",
  avatarUrl: "https://github.com/shadcn.png",
};

const rsvpdEvents: Event[] = [
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
    address: "123 Main St",
    city: "San Francisco",
    event_type: "Conference",
    created_at: "2024-01-01T00:00:00Z",
  },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">My Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rsvpdEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="space-y-4 max-w-md">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Update Profile</Button>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
