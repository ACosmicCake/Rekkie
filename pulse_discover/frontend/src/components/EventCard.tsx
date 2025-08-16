import { Event } from "@/types";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const {
    name,
    description,
    start_time,
    location_name,
    image_url,
    ticket_link,
  } = event;

  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-video relative">
        <Image
          src={image_url || "https://via.placeholder.com/400x200"}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">{name}</CardTitle>
        <div className="text-sm text-muted-foreground">
          <span>{new Date(start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
          <span className="mx-1">|</span>
          <span>{location_name}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-3">{description}</CardDescription>
      </CardContent>
      {ticket_link && (
        <CardFooter>
          <Button asChild className="w-full">
            <a href={ticket_link} target="_blank" rel="noopener noreferrer">
              Get Tickets
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
