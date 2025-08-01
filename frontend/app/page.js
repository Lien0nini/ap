"use client";

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import Tweet from '@/components/Tweet';
import PostBox from '@/components/PostBox';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomePage() {
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  const fetchFeed = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/posts/feed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      if (!res.ok) {
        const err = JSON.parse(text);
        throw new Error(err.message || 'Failed to load feed');
      }

      const data = JSON.parse(text);
      setPosts(data.feed);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFeed();
    }
  }, [token]);

  if (error) return <p className="text-red-500 text-center mt-4">Error loading feed: {error}</p>;

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto mt-4">
        <PostBox onPost={fetchFeed} />
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">No tweets yet.</p>
        ) : (
          posts.map((post) => (
            <Tweet
              key={`${post.id}-${post.is_retweet ? 'retweet' : 'tweet'}`}
              id={post.id}
              name={post.username}
              username={post.username}
              timestamp={post.created_at}
              content={post.content}
              profilePic={post.profile_picture || null}
              media={post.media_url || null}
              liked={post.liked}
              retweeted={post.retweeted}
              isRetweet={!!post.is_retweet}
              retweeter_username={post.retweeter_username} // Ensure this is passed
            />
          ))
        )}
      </div>
    </ProtectedRoute>
  );
}
