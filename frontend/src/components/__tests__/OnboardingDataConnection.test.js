import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import OnboardingDataConnection from '../OnboardingDataConnection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('manual entry navigates to cash flow setup', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <OnboardingDataConnection />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /manual entry/i }));
  expect(navigate).toHaveBeenCalledWith('/onboarding/cash-flow-setup');
});
