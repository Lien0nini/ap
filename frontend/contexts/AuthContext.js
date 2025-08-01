"use client";

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, message: errorText || 'Login failed.' };
      }

      const data = await res.json();

      if (!data.token) {
        return { success: false, message: 'Login failed: No token received.' };
      }

      const token = data.token;
      setToken(token);
      localStorage.setItem('token', token);

      const profileRes = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = await profileRes.json();
      setCurrentUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));

      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const signup = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      if (!res.ok) {
        const error = JSON.parse(text);
        throw new Error(error.message || 'Signup failed');
      }

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!token && !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, login, signup, logout, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
