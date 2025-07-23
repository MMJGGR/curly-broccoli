import { registerUser } from '../OnboardingWizard';

test('registerUser handles server error', async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: false,
    statusText: 'Bad',
    json: () => Promise.resolve({ detail: 'error' })
  }));
  window.alert = jest.fn();
  const result = await registerUser('', { questionnaire: [] }, jest.fn());
  expect(result).toBe(false);
  expect(window.alert).toHaveBeenCalledWith('Registration error: error');
});

test('registerUser handles network failure', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('fail')));
  window.alert = jest.fn();
  const result = await registerUser('', { questionnaire: [] }, jest.fn());
  expect(result).toBe(false);
  expect(window.alert).toHaveBeenCalled();
});
