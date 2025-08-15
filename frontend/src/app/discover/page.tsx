import { getWildcardSuggestions } from '@/lib/api';
import EventCard from '@/components/EventCard';

export default async function DiscoverPage() {
  const suggestions = await getWildcardSuggestions("user-123"); // Hardcoded user_id

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Discover New Events</h1>
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.event.event_id}>
            <p className="text-lg font-semibold mb-2">{suggestion.rationale}</p>
            <EventCard event={suggestion.event} />
          </div>
        ))}
      </div>
    </main>
  );
}
