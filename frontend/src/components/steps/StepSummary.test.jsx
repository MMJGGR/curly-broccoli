import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StepSummary from './StepSummary';

test('renders JSON summary', () => {
  const { getByText } = render(<StepSummary data={{ a: 1 }} />);
  expect(getByText(/"a": 1/)).toBeInTheDocument();
});
