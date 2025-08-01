import React from 'react';
import { render, screen } from '@testing-library/react';
import Tweet from '@/components/Tweet';

describe('Tweet', () => {
  test('renders tweet content', () => {
    render(
      <Tweet
        id={1}
        name="Willie"
        username="willie_wildcat"
        timestamp="just now"
        content="Hello world!"
        profilePic="/profile.jpg"
      />
    );

    expect(screen.getByText(/Hello world!/i)).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && content === 'Willie';
        })).toBeInTheDocument();
  });
});
