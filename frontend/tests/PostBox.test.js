import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostBox from '@/components/PostBox';

describe('PostBox', () => {
  test('renders textarea and disabled post button initially', () => {
    render(<PostBox />);
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
    const button = screen.getByText(/post/i);
    expect(button).toBeDisabled();
  });

  test('enables button when text is entered', () => {
    render(<PostBox />);
    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    const button = screen.getByText(/post/i);

    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    // NOTE: make sure your PostBox component actually updates button state on change!
    expect(button).not.toBeDisabled();
  });
});
