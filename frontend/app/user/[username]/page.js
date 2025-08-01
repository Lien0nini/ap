// ✅ UserProfilePage.js
"use client";

import React, { useContext, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Cake, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import Tweet from '@/components/Tweet';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UserProfilePage({ params }) {
  const { username } = use(params);
  const router = useRouter();
  const { currentUser, token, ready } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (ready && !token) {
      router.replace('/login');
    }
  }, [ready, token, router]);

  useEffect(() => {
    if (currentUser?.username === username) {
      router.replace('/profile');
    }
  }, [currentUser, username, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/users/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json(); // <-- Only call this once

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        setUser(data);
      } catch (err) {
        console.error('User fetch failed:', err);
        setError(err.message);
        // Optionally: router.replace('/404');
      }
    };

    const fetchTweets = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch tweets');
        const data = await res.json();
        setTweets(data.tweets || []);
      } catch (err) {
        console.error('Tweet fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username && token) {
      fetchUser();
      fetchTweets();
    }
  }, [username, token, router]);

  const handleFollow = async () => {
    try {
      const res = await fetch(`http://localhost:3001/social/follow/${user.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to follow user');
      setUser((prev) => ({
        ...prev,
        followerCount: prev.followerCount + 1,
      }));
    } catch (err) {
      console.error('Follow failed:', err.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await fetch(`http://localhost:3001/social/follow/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to unfollow user');
      setUser((prev) => ({
        ...prev,
        followerCount: prev.followerCount - 1,
      }));
    } catch (err) {
      console.error('Unfollow failed:', err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto mt-4 p-4">
        <div className="mb-6">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-semibold">Back</span>
            </div>
          </Link>
        </div>

        <div className="bg-gray-400 h-40 w-full relative">
          <div className="absolute -bottom-14 left-4 border-4 border-white dark:border-black rounded-full">
            {user?.profile_picture?.trim() ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="flex justify-end">
            {isOwnProfile ? (
              <button className="px-5 py-2 rounded-full text-white text-sm font-semibold transition bg-black hover:bg-gray-800">
                Edit Profile
              </button>
            ) : user?.isFollowed ? (
              <button
                className="px-5 py-2 rounded-full text-white text-sm font-semibold transition bg-red-500 hover:bg-red-600"
                onClick={handleUnfollow}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="px-5 py-2 rounded-full text-white text-sm font-semibold transition bg-black hover:bg-gray-800"
                onClick={handleFollow}
              >
                Follow
              </button>
            )}
          </div>

          <div className="mt-2">
            <h1 className="text-xl font-bold text-black dark:text-white">{user?.name || user?.username}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
          </div>

          <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center space-x-1">
              <Cake className="h-4 w-4" />
              <span>{user?.birthday || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{user?.joined || 'Joined Unknown'}</span>
            </div>
          </div>

          <div className="flex space-x-4 mt-2 text-sm">
            <span>
              <span className="font-semibold text-black dark:text-white">{user?.followingCount || 0}</span> <span className="text-gray-500 dark:text-gray-400">Following</span>
            </span>
            <span>
              <span className="font-semibold text-black dark:text-white">{user?.followerCount || 0}</span> <span className="text-gray-500 dark:text-gray-400">Followers</span>
            </span>
          </div>
        </div>

        <div className="flex justify-around mt-4 border-b border-gray-200 dark:border-gray-700">
          {['posts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 text-sm ${
                selectedTab === tab
                  ? 'text-black dark:text-white font-semibold border-b-2 border-black dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div>
          {loading ? (
            <p className="text-center mt-4">Loading profile...</p>
          ) : error || !user ? (
            <p className="text-red-500 text-center mt-4">Error: {error || 'User not found'}</p>
          ) : tweets.length > 0 ? (
            tweets.map((post) => <Tweet key={`${post.id}-${post.is_retweet ? 'retweet' : 'tweet'}`} {...post} />)
          ) : (
            <p className="text-center text-gray-500 mt-4">No posts yet.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
