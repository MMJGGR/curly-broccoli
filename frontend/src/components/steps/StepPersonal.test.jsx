import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StepPersonal from './StepPersonal';

test('updates first and last name', () => {
  const update = jest.fn();
  const { getByPlaceholderText } = render(<StepPersonal data={{}} update={update} />);
  fireEvent.change(getByPlaceholderText('First Name'), { target: { value: 'John' } });
  expect(update).toHaveBeenCalledWith({ firstName: 'John' });
  fireEvent.change(getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
  expect(update).toHaveBeenCalledWith({ lastName: 'Doe' });
});
