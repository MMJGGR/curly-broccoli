import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import OnboardingCashFlowSetup from '../OnboardingCashFlowSetup';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('next button navigates to dashboard', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <OnboardingCashFlowSetup />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /next: set your goals/i }));
  expect(navigate).toHaveBeenCalledWith('/app/dashboard');
});
