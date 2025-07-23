import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserDashboard from '../UserDashboard';
import { MemoryRouter } from 'react-router-dom';

test('navigates to other screens', async () => {
  const next = jest.fn();
  render(
    <MemoryRouter>
      <UserDashboard onNextScreen={next} />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /view detailed transactions/i }));
  expect(next).toHaveBeenCalledWith('AccountsTransactions');
  await userEvent.click(screen.getByRole('button', { name: /learn more & act/i }));
  expect(next).toHaveBeenCalledWith('AdviceModuleDetail');
  await userEvent.click(screen.getByRole('button', { name: /view all goals/i }));
  expect(next).toHaveBeenCalledWith('GoalsOverview');
});

test('message box flow', async () => {
  render(
    <MemoryRouter>
      <UserDashboard onNextScreen={() => {}} />
    </MemoryRouter>
  );
  await userEvent.click(screen.getByRole('button', { name: /explore projections/i }));
  expect(screen.getByText(/navigating to explore projections/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(screen.queryByText(/navigating to explore projections/i)).not.toBeInTheDocument();
});

test('renders initial message', () => {
  render(
    <MemoryRouter>
      <UserDashboard onNextScreen={() => {}} initialMessage="hi" initialShowMessageBox />
    </MemoryRouter>
  );
  expect(screen.getByText('hi')).toBeInTheDocument();
});
