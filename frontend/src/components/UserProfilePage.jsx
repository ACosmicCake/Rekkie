import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const UserProfilePage = () => {
  const [profile, setProfile] = useState({
    location_city: '',
    age: '',
    positive_preferences: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await api.getUserProfile();
        setProfile({
          location_city: data.location_city || '',
          age: data.age || '',
          // Join the array into a comma-separated string for the textarea
          positive_preferences: (data.positive_preferences || []).join(', '),
        });
      } catch (err) {
        setError('Failed to load profile.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const profileToUpdate = {
        ...profile,
        age: Number(profile.age) || null,
        // Split the string back into an array of strings
        positive_preferences: profile.positive_preferences.split(',').map(item => item.trim()).filter(Boolean),
      };

      await api.updateUserProfile(profileToUpdate);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="location_city" className="block text-sm font-medium text-gray-700">
              Your City
            </label>
            <input
              type="text"
              name="location_city"
              id="location_city"
              value={profile.location_city}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              id="age"
              value={profile.age}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="positive_preferences" className="block text-sm font-medium text-gray-700">
              Your Likes & Interests
            </label>
            <textarea
              name="positive_preferences"
              id="positive_preferences"
              rows="4"
              value={profile.positive_preferences}
              onChange={handleChange}
              placeholder="Enter your interests, separated by commas"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Separate different interests with a comma.
            </p>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
          {successMessage && <p className="text-sm text-green-600 mt-4">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
