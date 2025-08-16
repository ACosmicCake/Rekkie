"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, getAppConfig } from "@/lib/api";

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  isAnonymousMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);

  useEffect(() => {
    getAppConfig().then((config) => {
      setIsAnonymousMode(config.anonymous_mode_enabled);
      if (config.anonymous_mode_enabled) {
        setIsAuthenticated(true); // Treat as "logged in" for UI flow
        setLoading(false);
      } else {
        const token = localStorage.getItem("token");
        if (token) {
          getCurrentUser(token)
            .then((userData) => {
              setUser(userData);
              setIsAuthenticated(true);
            })
            .catch(() => {
              localStorage.removeItem("token");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      }
    });
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    getCurrentUser(token).then((userData) => {
      setUser(userData);
      setIsAuthenticated(true);
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, isAnonymousMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
