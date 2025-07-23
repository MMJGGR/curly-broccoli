import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import OnboardingDataConnection from '../OnboardingDataConnection';

test('action buttons show and hide message box', async () => {
  render(
    <MemoryRouter>
      <OnboardingDataConnection />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /connect m-pesa sms/i }));
  expect(screen.getByText(/wireframe action/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(screen.queryByText(/wireframe action/i)).not.toBeInTheDocument();
});
