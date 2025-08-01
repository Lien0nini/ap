import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';
import { AuthContext } from '@/contexts/AuthContext';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Navbar', () => {
  const renderWithContext = (isLoggedIn = true, logout = jest.fn()) =>
    render(
      <AuthContext.Provider value={{ isLoggedIn, logout }}>
        <Navbar />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    mockPush.mockClear();
  });

  test('renders search input', () => {
    renderWithContext();
    const searchInput = screen.getByPlaceholderText(/search username/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('shows profile and logout when logged in', () => {
    renderWithContext(true);
    expect(screen.getByText(/Willie the Wildcat/i)).toBeInTheDocument();
    expect(screen.getByTitle(/logout/i)).toBeInTheDocument();
  });

  test('does not show profile and logout when logged out', () => {
    renderWithContext(false);
    expect(screen.queryByText(/Willie the Wildcat/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/logout/i)).not.toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const logoutMock = jest.fn();

    renderWithContext(true, logoutMock);

    const logoutButton = screen.getByTitle(/logout/i);
    await user.click(logoutButton);

    expect(logoutMock).toHaveBeenCalled();
  });

  test('does not navigate on Enter key in search input', async () => {
    const user = userEvent.setup();
    renderWithContext();

    const searchInput = screen.getByPlaceholderText(/search username/i);
    await user.type(searchInput, 'someuser{enter}');

    expect(mockPush).not.toHaveBeenCalled();
  });
});
