import { render, fireEvent } from '@testing-library/react';
import StepFinancial from './StepFinancial';

test('updates annual income', () => {
  const update = jest.fn();
  const { getByPlaceholderText } = render(<StepFinancial data={{}} update={update} />);
  fireEvent.change(getByPlaceholderText('Annual Income'), { target: { value: '1000' } });
  expect(update).toHaveBeenCalledWith({ annualIncome: '1000' });
});
