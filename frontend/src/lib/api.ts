import { Event, Preference, User, UserRegister, WildcardSuggestion } from '@/lib/types';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getEvents(city?: string, startDate?: string, endDate?: string): Promise<Event[]> {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/api/events?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
}

export async function getWildcardSuggestions(userId: string): Promise<WildcardSuggestion[]> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/wildcard-suggestions?user_id=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wildcard suggestions');
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }

  return response.json();
}

export async function register(user: UserRegister): Promise<User> {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error('Failed to register');
  }

  return response.json();
}

export async function login(formData: FormData): Promise<{ access_token: string }> {
  const response = await fetch(`${API_URL}/api/token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  return response.json();
}

export async function getUserPreferences(userId: string): Promise<Preference> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/users/${userId}/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user preferences');
  }

  return response.json();
}

export async function updateUserPreferences(userId: string, preferences: Preference): Promise<Preference> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/users/${userId}/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update user preferences');
  }

  return response.json();
}

export async function getRecommendations(userId: string): Promise<Event[]> {
  const response = await fetch(`${API_URL}/api/recommendations?user_id=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return response.json();
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await fetch(`${API_URL}/api/events/${eventId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }

  return response.json();
}