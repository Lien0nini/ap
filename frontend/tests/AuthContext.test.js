import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';

function TestComponent() {
  const { isLoggedIn, login, logout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="status">{isLoggedIn ? 'Logged In' : 'Logged Out'}</span>
      <button onClick={() => login('willie', 'wildcat123')}>Log In</button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  test('login sets isLoggedIn to true', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('Logged Out');

    await user.click(screen.getByText(/log in/i));
    expect(screen.getByTestId('status')).toHaveTextContent('Logged In');
  });

  test('logout sets isLoggedIn to false', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First log in
    await user.click(screen.getByText(/log in/i));
    expect(screen.getByTestId('status')).toHaveTextContent('Logged In');

    // Then log out
    await user.click(screen.getByText(/log out/i));
    expect(screen.getByTestId('status')).toHaveTextContent('Logged Out');
  });
});
