import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { getPersonalizedEvents, getWildcardEvents } from "@/server/rank/rank"
import { Event } from "@prisma/client"
import EventCard from "@/components/events/EventCard" // I will create this later

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.onboardingComplete) {
    redirect("/onboarding")
  }

  const [recommendedEvents, wildcardEvents] = await Promise.all([
    getPersonalizedEvents(session.user.id),
    getWildcardEvents(session.user.id),
  ]);

  const now = new Date();
  const endOfTonight = new Date();
  endOfTonight.setHours(23, 59, 59, 999);

  const endOfWeekend = new Date();
  const dayOfWeek = endOfWeekend.getDay(); // Sunday - 0, Monday - 1, ...
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeekend.setDate(endOfWeekend.getDate() + daysUntilSunday);
  endOfWeekend.setHours(23, 59, 59, 999);

  const tonightEvents = recommendedEvents.filter(e => e.startsAt > now && e.startsAt < endOfTonight);
  const thisWeekendEvents = recommendedEvents.filter(e => e.startsAt > now && e.startsAt < endOfWeekend);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Your Event Dashboard</h1>

      <section>
        <h2 className="text-2xl font-bold mb-4">For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.length > 0 ? (
            recommendedEvents.map(event => <EventCard key={event.id} event={event} />)
          ) : (
            <p>No recommendations for you yet. Check back later!</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Wildcard Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wildcardEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      {/* TODO: Add sections for Tonight, This Weekend, Movies, Clubs, etc. */}
    </div>
  )
}
