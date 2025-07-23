import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvisorDashboard from '../AdvisorDashboard';

test('navigates to client list', async () => {
  const next = jest.fn();
  render(<AdvisorDashboard onNextScreen={next} />);
  await userEvent.click(screen.getByRole('button', { name: /view all clients/i }));
  expect(next).toHaveBeenCalledWith('ClientList');
});

test('message box hides on close', async () => {
  render(
    <AdvisorDashboard
      onNextScreen={() => {}}
      initialMessage="Hello"
      initialShowMessageBox={true}
    />
  );
  expect(screen.getByText('Hello')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(screen.queryByText('Hello')).not.toBeInTheDocument();
});
