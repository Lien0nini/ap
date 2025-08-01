"use client";

import React from 'react';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await login(username, password);
    if (success) {
      router.push('/');
    } else {
      setError(message || 'Login failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
          Login
        </h1>

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-600 p-2 rounded text-sm placeholder-gray-400 dark:placeholder-gray-500 text-black dark:text-white focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-600 p-2 rounded text-sm placeholder-gray-400 dark:placeholder-gray-500 text-black dark:text-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-full text-sm font-semibold transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
