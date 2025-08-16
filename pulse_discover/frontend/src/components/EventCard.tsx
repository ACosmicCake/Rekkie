import { Event } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.event_id}`}>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="aspect-video relative">
            <Image
              src={event.image_url || "https://via.placeholder.com/400x200"}
              alt={event.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg font-bold mb-2">{event.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(event.start_time).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">{event.location_name}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">View Event</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
