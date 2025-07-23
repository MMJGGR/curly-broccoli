import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiskQuestionnaire from '../RiskQuestionnaire';
import { MemoryRouter } from 'react-router-dom';

test('form enables submit when all questions answered', async () => {
  render(
    <MemoryRouter>
      <RiskQuestionnaire />
    </MemoryRouter>
  );

  const submit = screen.getByRole('button', { name: /calculate my risk profile/i });
  expect(submit).toBeDisabled();
  const radios = screen.getAllByRole('radio');
  for (let i = 0; i < radios.length; i += 4) {
    await userEvent.click(radios[i]);
  }
  expect(submit).toBeEnabled();
});
