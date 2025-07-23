import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import AuthScreen from '../AuthScreen';

jest.setTimeout(10000);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('login submits and navigates', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>
  );
  await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'pw');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  await screen.findByText(/login successful/i);
  expect(navigate).toHaveBeenCalledWith('/onboarding/personal-details');
});

test('register flow toggles and submits', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /need an account/i }));
  await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'pw');
  await userEvent.click(screen.getByRole('button', { name: /register/i }));
  await screen.findByText(/registration successful/i, {}, { timeout: 2000 });
  expect(navigate).toHaveBeenCalledWith('/onboarding/personal-details');
});

test('forgot password shows and hides message', async () => {
  render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByText(/forgot password/i));
  const msg = await screen.findByText(/action: forgot password/i);
  expect(msg).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(screen.queryByText(/forgot password/i)).toBeInTheDocument();
});
