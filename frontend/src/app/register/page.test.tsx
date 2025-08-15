import { render, screen } from '@testing-library/react';
import RegisterPage from './page';

describe('RegisterPage', () => {
  it('renders the register form', () => {
    render(<RegisterPage />);
    const heading = screen.getByRole('heading', { name: /register/i });
    expect(heading).toBeInTheDocument();
  });
});
