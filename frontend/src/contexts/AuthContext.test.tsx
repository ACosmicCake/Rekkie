import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function TestComponent() {
  const { user } = useAuth();
  return <div>{user ? user.email : 'No user'}</div>;
}

describe('AuthContext', () => {
  it('provides the user to child components', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('No user')).toBeInTheDocument();
  });
});
