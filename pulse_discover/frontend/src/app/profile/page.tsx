"use client";

import { useState, useEffect, FormEvent } from 'react';
import { UserInterest } from '@/types'; // This type will need to be created

// Dummy user ID - replace with actual logged-in user logic
const DUMMY_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

export default function ProfilePage() {
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInterestCategory, setNewInterestCategory] = useState('');
  const [newInterestValue, setNewInterestValue] = useState('');

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/users/${DUMMY_USER_ID}/interests`);
      if (!response.ok) {
        throw new Error('Failed to fetch interests');
      }
      const data = await response.json();
      setInterests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleAddInterest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newInterestCategory.trim() || !newInterestValue.trim()) {
        alert("Please enter both category and value for the interest.");
        return;
    }

    try {
      const response = await fetch(`http://localhost:8000/users/${DUMMY_USER_ID}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newInterestCategory, value: newInterestValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to add interest');
      }
      setNewInterestCategory('');
      setNewInterestValue('');
      fetchInterests(); // Refresh interests list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteInterest = async (interestId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/users/interests/${interestId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete interest');
      }
      fetchInterests(); // Refresh interests list
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (loading) {
    return <p className="text-center mt-8">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Your Interests</h2>
        <form onSubmit={handleAddInterest} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newInterestCategory}
            onChange={(e) => setNewInterestCategory(e.target.value)}
            placeholder="Interest Category (e.g., music)"
            className="input input-bordered w-full"
          />
          <input
            type="text"
            value={newInterestValue}
            onChange={(e) => setNewInterestValue(e.target.value)}
            placeholder="Interest Value (e.g., Jazz)"
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        <div>
          {interests.length > 0 ? (
            <ul className="space-y-2">
              {interests.map((interest) => (
                <li key={interest.interest_id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                  <span>
                    <span className="font-bold">{interest.category}:</span> {interest.value}
                  </span>
                  <button onClick={() => handleDeleteInterest(interest.interest_id)} className="btn btn-sm btn-error">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no saved interests yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
