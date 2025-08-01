"use client";

import React, { useContext, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Cake, User } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import Tweet from '@/components/Tweet';
import { Dialog } from '@headlessui/react'; // Install @headlessui/react if not present

export default function ProfilePage() {
  const { currentUser, token } = useContext(AuthContext);
  // Set initial form state to empty
  const [form, setForm] = useState({
    username: '',
    birthday: '',
    profile_picture: '',
  });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef();
  const router = useRouter();

  // When currentUser loads, update form state
  useEffect(() => {
    if (currentUser) {
      setForm({
        username: currentUser.username || '',
        birthday: currentUser.birthday || '',
        profile_picture: currentUser.profile_picture || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/login');
      return;
    }

    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/user/${currentUser.username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setUserPosts(data.tweets || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentUser, token, router]);

  const handleEditClick = () => {
    setForm({
      username: currentUser.username || '',
      profile_picture: currentUser.profile_picture || '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Simple upload logic (replace with your actual upload endpoint)
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setForm((f) => ({ ...f, profile_picture: data.url }));
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          birthday: form.birthday,
          profile_picture: form.profile_picture,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: 'Failed to update profile',
        }));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await res.json();
      setIsModalOpen(false);
      router.refresh?.();
    } catch (err) {
      console.error('Profile update error:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!token || !currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto mt-4 p-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-semibold">Back</span>
          </div>
        </Link>
      </div>

      {/* Banner */}
      <div className="bg-gray-400 h-40 w-full relative">
        <div className="absolute -bottom-14 left-4 border-4 border-white dark:border-black rounded-full">
          {currentUser.profile_picture ? (
            <img
              src={currentUser.profile_picture}
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

      {/* Profile section */}
      <div className="px-5 pt-5">
        <div className="flex justify-end">
          <button
            className="px-5 py-2 rounded-full text-white text-sm font-semibold transition bg-black hover:bg-gray-800 cursor-pointer"
            onClick={handleEditClick}
          >
            Edit profile
          </button>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-bold text-black dark:text-white">
            {currentUser.name || currentUser.username}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{currentUser.username}</p>
        </div>

        <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center space-x-1">
            <Cake className="h-4 w-4" />
            <span>{currentUser.birthday || 'Unknown'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{currentUser.joined || 'Joined Unknown'}</span>
          </div>
        </div>

        <div className="flex space-x-4 mt-2 text-sm">
          <span>
            <span className="font-semibold text-black dark:text-white">{currentUser.followingCount || 0}</span>{' '}
            <span className="text-gray-500 dark:text-gray-400">Following</span>
          </span>
          <span>
            <span className="font-semibold text-black dark:text-white">{currentUser.followerCount || 0}</span>{' '}
            <span className="text-gray-500 dark:text-gray-400">Followers</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around mt-4 border-b border-gray-200 dark:border-gray-700">
        <button className="py-2 text-sm text-black dark:text-white font-semibold border-b-2 border-black dark:border-white">
          Posts
        </button>
        <button className="py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
          Replies
        </button>
        <button className="py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
          Media
        </button>
      </div>

      {/* Tweets */}
      <div>
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Loading posts...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-4">Error: {error}</p>
        ) : userPosts.length > 0 ? (
          userPosts
            .filter((post) => typeof post === 'object' && post !== null)
            .map((post) => (
              <Tweet
                key={post.id}
                id={post.id}
                name={post.original_username || post.username}
                username={post.original_username || post.username}
                timestamp={post.created_at}
                content={post.content}
                profilePic={post.profile_picture}
                media={post.media_url}
                liked={post.liked}
                retweeted={post.retweeted}
                isRetweet={!!post.is_retweet}
                retweeter_username={post.retweeter_username} // Ensure this is passed
              />
            ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No posts yet.</p>
        )}
      </div>


      {/* Edit Profile Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white dark:bg-black p-6 rounded-lg shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-6 text-center">Edit Profile</Dialog.Title>
            {/* Profile Picture at the top */}
            <div className="flex flex-col items-center mb-4">
              {form.profile_picture ? (
                <img
                  src={form.profile_picture}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <label
                htmlFor="profilePicUpload"
                className="mt-3 cursor-pointer px-5 py-2 bg-black text-white rounded-full text-sm font-semibold shadow transition hover:bg-gray-800"
              >
                {form.profile_picture ? 'Change Photo' : 'Upload Photo'}
              </label>
              <input
                id="profilePicUpload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-5 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-semibold transition hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold transition hover:bg-gray-800 cursor-pointer"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
