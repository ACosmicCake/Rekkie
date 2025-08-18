import { Event } from "@/types";

const API_URL = "http://localhost:8000"; // Ensure this is your backend URL

// Profile Endpoints
export const getUserProfile = async (name: string) => {
  const response = await fetch(`${API_URL}/profiles/${name}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null; // User not found is a valid case
    }
    throw new Error("Failed to fetch user profile");
  }
  return response.json();
};

export const saveUserProfile = async (profileData: {
  name: string;
  city: string;
  preferences: string[];
}) => {
  const response = await fetch(`${API_URL}/profiles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error("Failed to save user profile");
  return response.json();
};

// Event Endpoints
export const ingestEvents = async (
  city: string,
  user_preferences: string[],
  max_events: number = 10
) => {
  const response = await fetch(`${API_URL}/events/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, user_preferences, max_events }),
  });
  if (!response.ok) throw new Error("Event ingestion failed");
  return response.json();
};

export const searchEvents = async (params: {
  location?: string;
  keyword?: string;
}): Promise<Event[]> => {
  const query = new URLSearchParams();
  if (params.location) query.append("location", params.location);
  if (params.keyword) query.append("keyword", params.keyword);

  const response = await fetch(`${API_URL}/events/search?${query.toString()}`);
  if (!response.ok) throw new Error("Failed to search events");
  return response.json();
};
