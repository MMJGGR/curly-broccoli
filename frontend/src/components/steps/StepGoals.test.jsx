import { render, fireEvent } from '@testing-library/react';
import StepGoals from './StepGoals';

test('updates goal type', () => {
  const update = jest.fn();
  const { getByDisplayValue } = render(<StepGoals data={{}} update={update} />);
  fireEvent.change(getByDisplayValue(''), { target: { value: 'Retirement' } });
  expect(update).toHaveBeenCalledWith({ goalType: 'Retirement' });
});
