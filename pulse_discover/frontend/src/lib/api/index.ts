import { Event } from "@/types";

const API_URL = "http://localhost:8000";

// User Endpoints
export const registerUser = async (userData: any) => {
  console.log("registerUser called with", userData);
  // const response = await fetch(`${API_URL}/users/register`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(userData),
  // });
  // if (!response.ok) throw new Error("Registration failed");
  // return response.json();
  return { message: "Registration successful" }; // Placeholder
};

export const loginUser = async (credentials: any) => {
  console.log("loginUser called with", credentials);
  // const response = await fetch(`${API_URL}/token`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //   body: new URLSearchParams(credentials),
  // });
  // if (!response.ok) throw new Error("Login failed");
  // return response.json();
  return { access_token: "fake-token", token_type: "bearer" }; // Placeholder
};

export const getCurrentUser = async (token: string) => {
  console.log("getCurrentUser called with token", token);
  // const response = await fetch(`${API_URL}/users/me`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // if (!response.ok) throw new Error("Failed to fetch user");
  // return response.json();
  return { username: "testuser", email: "test@example.com" }; // Placeholder
};

// Event Endpoints
export const getEvents = async (): Promise<Event[]> => {
  console.log("getEvents called");
  // const response = await fetch(`${API_URL}/events`);
  // if (!response.ok) throw new Error("Failed to fetch events");
  // return response.json();
  return []; // Placeholder
};

export const getEventById = async (eventId: string): Promise<Event> => {
  console.log("getEventById called with", eventId);
  // const response = await fetch(`${API_URL}/events/${eventId}`);
  // if (!response.ok) throw new Error("Failed to fetch event");
  // return response.json();
  return {} as Event; // Placeholder
};

// Interaction Endpoints
export const rsvpToEvent = async (eventId: string, token: string) => {
  console.log("rsvpToEvent called for event", eventId);
  // const response = await fetch(`${API_URL}/interactions/event/${eventId}/rsvp`, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // if (!response.ok) throw new Error("RSVP failed");
  // return response.json();
  return { message: "RSVP successful" }; // Placeholder
};
