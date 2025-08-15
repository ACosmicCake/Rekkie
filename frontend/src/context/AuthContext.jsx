import React, { createContext, useState, useContext } from 'react';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token);
        setToken(response.access_token);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
