"use client";

import React from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white p-6">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg mb-6 text-center max-w-md">
        We couldn’t load the page you were looking for. Please try again or return to the homepage.
      </p>
      <Link
        href="/"
        className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
