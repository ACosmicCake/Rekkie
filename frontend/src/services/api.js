const API_BASE_URL = 'http://localhost:8000';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || 'An error occurred');
    }
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};

// --- Authentication ---
export const loginUser = (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  return request('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
};

// --- Profile ---
export const getUserProfile = () => {
  return request('/profile/me');
};

export const updateUserProfile = (profileData) => {
  return request('/profile/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

// --- Events & Recommendations ---
export const getEvents = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/events/?${query}`);
};

export const refreshRecommendations = () => {
  return request('/recommendations/refresh', {
    method: 'POST',
  });
};

// --- Interactions ---
export const createInteraction = (interactionData) => {
  return request('/interactions/', {
    method: 'POST',
    body: JSON.stringify(interactionData),
  });
};
