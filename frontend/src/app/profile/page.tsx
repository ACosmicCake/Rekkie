'use client';

import { useEffect, useState } from 'react';
import { getUserPreferences, updateUserPreferences } from '@/lib/api';
import { Preference } from '@/lib/types';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preference | null>(null);

  useEffect(() => {
    if (user) {
      getUserPreferences(user.user_id).then(setPreferences);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preferences && user) {
      const updatedPreferences = await updateUserPreferences(user.user_id, preferences);
      setPreferences(updatedPreferences);
    }
  };

  if (!preferences) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Preferences</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="liked_genres" className="block text-sm font-medium text-gray-700">
            Liked Genres
          </label>
          <input
            type="text"
            id="liked_genres"
            value={preferences.liked_genres.join(', ')}
            onChange={(e) =>
              setPreferences({ ...preferences, liked_genres: e.target.value.split(',').map(s => s.trim()) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save
        </button>
      </form>
    </main>
  );
}

export default withAuth(ProfilePage);
