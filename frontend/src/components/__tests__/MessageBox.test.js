import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageBox from '../MessageBox';

test('renders message and calls onClose', async () => {
  const onClose = jest.fn();
  render(<MessageBox message="hi" onClose={onClose} />);
  expect(screen.getByText('hi')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /ok/i }));
  expect(onClose).toHaveBeenCalled();
});
