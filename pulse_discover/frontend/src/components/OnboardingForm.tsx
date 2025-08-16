"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ingestEvents } from "@/lib/api";

const preferenceCategories = {
  Music: ["Live Music", "Concerts", "Festivals", "DJ Sets"],
  "Food & Drink": [
    "Food Festivals",
    "Wine Tasting",
    "Craft Beer",
    "Farmers Market",
  ],
  "Arts & Culture": [
    "Art Exhibitions",
    "Museums",
    "Theater",
    "Film Screenings",
  ],
  Community: ["Workshops", "Meetups", "Charity Events", "Local Fairs"],
};

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleFetchEvents = async () => {
    if (!city || selectedPreferences.length === 0) {
      alert("Please enter your city and select at least one interest.");
      return;
    }
    setIsLoading(true);
    try {
      await ingestEvents(city, selectedPreferences);
      sessionStorage.setItem("onboardingCompleted", "true");
      router.push("/");
      // A full reload might be necessary if the page doesn't update automatically
      // This ensures the main page re-evaluates sessionStorage
      window.location.reload();
    } catch (error) {
      console.error("Failed to fetch events:", error);
      alert("There was an error fetching events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <CardHeader>
              <CardTitle>Welcome to PulseDiscover</CardTitle>
              <CardDescription>
                Let's get to know you. What should we call you?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={nextStep} disabled={!name}>
                Next
              </Button>
            </CardFooter>
          </div>
        );
      case 2:
        return (
          <div>
            <CardHeader>
              <CardTitle>Where are you located?</CardTitle>
              <CardDescription>
                We'll use this to find events near you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., San Francisco"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} disabled={!city}>
                Next
              </Button>
            </CardFooter>
          </div>
        );
      case 3:
        return (
          <div>
            <CardHeader>
              <CardTitle>What are your interests?</CardTitle>
              <CardDescription>
                Select a few to help us find events you'll love.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(preferenceCategories).map(
                ([category, preferences]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {preferences.map((preference) => (
                        <Button
                          key={preference}
                          variant={
                            selectedPreferences.includes(preference)
                              ? "default"
                              : "secondary"
                          }
                          onClick={() => handlePreferenceToggle(preference)}
                        >
                          {preference}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                onClick={handleFetchEvents}
                disabled={selectedPreferences.length === 0 || isLoading}
              >
                {isLoading ? "Fetching..." : "Fetch Events"}
              </Button>
            </CardFooter>
          </div>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-2xl">{renderStep()}</Card>
    </div>
  );
}
