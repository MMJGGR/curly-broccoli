import { render, fireEvent, screen } from '@testing-library/react';
import Onboarding from './Onboarding';

test('shows next step on Next click', () => {
  render(<Onboarding />);
  expect(screen.getByText('Personal Info')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Next'));
  expect(screen.getByText('Employment')).toBeInTheDocument();
});
