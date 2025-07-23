import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import RiskQuestionnaire from '../RiskQuestionnaire';

jest.setTimeout(10000);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('submitting questionnaire shows result and navigates', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <RiskQuestionnaire />
    </MemoryRouter>
  );
  const radios = screen.getAllByRole('radio');
  for (let i = 0; i < radios.length; i += 4) {
    await userEvent.click(radios[i]);
  }
  await userEvent.click(screen.getByRole('button', { name: /calculate my risk profile/i }));
  await screen.findByText(/your risk score is/i, {}, { timeout: 2000 });
  expect(navigate).toHaveBeenCalledWith('/onboarding/data-connection');
});
