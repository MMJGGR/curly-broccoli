import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

test('advisor login route renders AdvisorLogin', () => {
  render(
    <MemoryRouter initialEntries={['/advisor/login']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/advisor login/i)).toBeInTheDocument();
});

test('unknown route redirects to auth', () => {
  render(
    <MemoryRouter initialEntries={['/something']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});
