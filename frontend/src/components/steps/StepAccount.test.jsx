import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StepAccount from './StepAccount';

test('updates email and password fields', () => {
  const update = jest.fn();
  const { getByPlaceholderText } = render(<StepAccount data={{}} update={update} />);
  fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'user@x.com' } });
  expect(update).toHaveBeenCalledWith({ email: 'user@x.com' });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'pass' } });
  expect(update).toHaveBeenCalledWith({ password: 'pass' });
});
