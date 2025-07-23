import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Onboarding from '../Onboarding';

test('navigate through onboarding steps', async () => {
  render(<Onboarding />);
  expect(screen.getByText(/personal info/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText(/employment/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText(/dependents/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText(/preview/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /back/i }));
  expect(screen.getByText(/dependents/i)).toBeInTheDocument();
});
