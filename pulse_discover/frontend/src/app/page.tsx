import EventCard from '@/components/EventCard';

const mockEvents = [
  {
    name: 'Jazz Night at The Blue Note',
    description: 'An evening of smooth jazz with the legendary Herbie Hancock.',
    startTime: '2025-09-15T20:00:00Z',
    locationName: 'The Blue Note',
    city: 'New York',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ticketLink: '#',
  },
  {
    name: 'Art Exhibition: Modern Abstracts',
    description: 'Explore the latest works from upcoming abstract artists.',
    startTime: '2025-09-20T10:00:00Z',
    locationName: 'Metropolitan Museum of Art',
    city: 'New York',
    imageUrl: 'https://images.unsplash.com/photo-1579542839394-c65a43683f12?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ticketLink: '#',
  },
  {
    name: 'Shakespeare in the Park: Hamlet',
    description: 'A classic tragedy performed under the stars.',
    startTime: '2025-09-22T19:30:00Z',
    locationName: 'Delacorte Theater',
    city: 'New York',
    imageUrl: 'https://images.unsplash.com/photo-1589928339389-3453a25a81a7?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ticketLink: '#',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100">
      <h1 className="text-5xl font-bold mb-8 text-black">Upcoming Events</h1>
      <div className="flex flex-wrap justify-center">
        {mockEvents.map((event) => (
          <EventCard key={event.name} {...event} />
        ))}
      </div>
    </main>
  );
}
