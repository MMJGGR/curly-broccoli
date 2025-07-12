import { render, fireEvent, screen } from '@testing-library/react';
import OnboardingWizard from './OnboardingWizard';

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ access_token: 'x' }) }));
});

test('navigates through steps', async () => {
  render(<OnboardingWizard />);
  // step 1
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Next'));
  // step 2
  expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
});

