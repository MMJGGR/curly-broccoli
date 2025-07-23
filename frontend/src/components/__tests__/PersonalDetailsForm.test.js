import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import PersonalDetailsForm from '../PersonalDetailsForm';

jest.setTimeout(15000);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('submit saves details and navigates', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  render(
    <MemoryRouter>
      <PersonalDetailsForm />
    </MemoryRouter>
  );
  await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
  await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
  await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
  await userEvent.type(screen.getByLabelText(/kra pin/i), 'A123');
  await userEvent.click(screen.getByRole('button', { name: /next: risk questionnaire/i }));
  await screen.findByText(/personal details saved/i, {}, { timeout: 2000 });
  expect(navigate).toHaveBeenCalledWith('/onboarding/risk-questionnaire');
});
