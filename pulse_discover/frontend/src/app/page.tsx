"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/ui/loader";
import { EventCard } from "@/components/EventCard";
import { Event } from "@/types";
import {
  getUserProfile,
  saveUserProfile,
  ingestEvents,
  searchEvents,
} from "@/lib/api";

const majorCities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "San Francisco",
  "Charlotte",
  "Indianapolis",
  "Seattle",
  "Denver",
  "London",
  "Paris",
  "Tokyo",
  "Dubai",
  "Singapore",
];

const predefinedHobbies = [
  "Live Music",
  "Art Galleries",
  "Hiking",
  "Yoga",
  "Reading",
  "Cooking",
  "Gaming",
  "Traveling",
  "Photography",
  "Film",
  "Theater",
  "Craft Beer",
  "Wine Tasting",
  "Museums",
  "Stand-up Comedy",
  "Cycling",
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [customPreference, setCustomPreference] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleNameSubmit = async () => {
    if (!name) return;
    setIsCheckingUser(true);
    try {
      const userProfile = await getUserProfile(name);
      if (userProfile) {
        setCity(userProfile.city);
        setPreferences(userProfile.preferences);
      }
      setStep(2);
    } catch {
      // User not found is expected, proceed to next step
      setStep(2);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleAddCustomPreference = () => {
    if (customPreference && !preferences.includes(customPreference)) {
      setPreferences([...preferences, customPreference]);
      setCustomPreference("");
    }
  };

  const togglePreference = (preference: string) => {
    setPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleFetchEvents = async () => {
    if (!city || preferences.length === 0) {
      setError("Please select a city and at least one preference.");
      return;
    }
    setError(null);
    setStep(4); // Loading view

    try {
      await saveUserProfile({ name, city, preferences });
      await ingestEvents(city, preferences, 20); // Ingest more events
      const fetchedEvents = await searchEvents({ location: city });
      setEvents(fetchedEvents);
      setStep(5); // Events view
    } catch (err) {
      console.error(err);
      setError("Failed to fetch events. Please try again later.");
      setStep(3); // Go back to preferences step on error
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Welcome & Name
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Welcome to PulseDiscover
              </CardTitle>
              <CardDescription>
                What should we call you?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNameSubmit}
                disabled={!name || isCheckingUser}
              >
                {isCheckingUser ? <Loader /> : "Continue"}
              </Button>
            </CardFooter>
          </Card>
        );

      case 2: // City Selection
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Your City</CardTitle>
              <CardDescription>
                Where will you be discovering events?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setCity} value={city}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {majorCities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!city}>
                Next
              </Button>
            </CardFooter>
          </Card>
        );

      case 3: // Hobbies & Preferences
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Tell us what you love</CardTitle>
              <CardDescription>
                Select your interests to get personalized event recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Select your hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {predefinedHobbies.map((hobby) => (
                    <Button
                      key={hobby}
                      variant={
                        preferences.includes(hobby) ? "default" : "secondary"
                      }
                      onClick={() => togglePreference(hobby)}
                      size="sm"
                    >
                      {hobby}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Add your own</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Street Art"
                    value={customPreference}
                    onChange={(e) => setCustomPreference(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPreference()}
                  />
                  <Button onClick={handleAddCustomPreference}>Add</Button>
                </div>
              </div>
               {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleFetchEvents}
                disabled={preferences.length === 0}
              >
                Fetch Events
              </Button>
            </CardFooter>
          </Card>
        );

      case 4: // Loading
        return (
          <div className="text-center">
            <Loader className="h-16 w-16" />
            <p className="mt-4 text-lg">Finding the best events for you...</p>
          </div>
        );

      case 5: // Event Display
        return (
          <div className="w-full">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Your Personalized Events</h1>
                <p className="text-muted-foreground">Based on your preferences in {city}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      {renderStep()}
    </main>
  );
}
