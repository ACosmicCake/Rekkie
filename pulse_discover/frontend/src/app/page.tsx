import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="container flex flex-col items-center justify-center text-center py-20 md:py-32">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        Discover Your Next Great Event
      </h1>
      <p className="max-w-[700px] text-lg text-muted-foreground mb-8">
        PulseDiscover helps you find the best events happening in your area. From
        concerts and festivals to workshops and conferences, we've got you
        covered.
      </p>
      <Button asChild size="lg">
        <Link href="/register">Get Started</Link>
      </Button>
    </section>
  );
}
