import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import OnboardingCashFlowSetup from '../OnboardingCashFlowSetup';

test('add income source message box opens and closes', async () => {
  render(
    <MemoryRouter>
      <OnboardingCashFlowSetup />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /add another income source/i }));
  expect(screen.getByText(/wireframe action/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(screen.queryByText(/wireframe action/i)).not.toBeInTheDocument();
});
