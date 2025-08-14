import prisma from "@/lib/db"
import { notFound } from "next/navigation"

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      venue: true,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        <p className="text-lg text-gray-600 mb-6">
          {new Date(event.startsAt).toLocaleString()}
        </p>

        <div className="prose max-w-none">
          <p>{event.description}</p>
        </div>

        {event.venue && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Venue</h2>
            <p>{event.venue.name}</p>
            <p>{event.venue.address}</p>
            {/* Map placeholder */}
            <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Map placeholder</p>
            </div>
          </div>
        )}

        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Tags</h2>
            <div className="flex flex-wrap">
                {event.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Sources</h2>
            <ul>
                {(event.sources as { name: string, url: string }[]).map((source, index) => (
                    <li key={index}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {source.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>

        {/* Placeholder for "Why we recommended this" */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h2 className="text-xl font-bold mb-2">Why we recommended this</h2>
            <p className="text-gray-600">Personalized recommendation justification will be displayed here.</p>
        </div>

        {/* Placeholder for "Similar Events" */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-2">Similar Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* TODO: Fetch and display similar events */}
                <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center"><p>Similar Event 1</p></div>
                <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center"><p>Similar Event 2</p></div>
                <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center"><p>Similar Event 3</p></div>
            </div>
        </div>
      </div>
    </div>
  );
}
