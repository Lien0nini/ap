'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostPage from '@/components/PostPage';

export default function PostPageWrapper() {
  const { id } = useParams();
  return <PostPage id={id} />;
}
