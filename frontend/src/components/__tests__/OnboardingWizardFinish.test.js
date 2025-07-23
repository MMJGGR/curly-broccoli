import { registerUser } from '../OnboardingWizard';

jest.setTimeout(30000);

test('registerUser stores token and returns true', async () => {
  const setProfile = jest.fn();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ access_token: 'tok', risk_score: 1, risk_level: 2 }),
    })
  );
  const ok = await registerUser('', { questionnaire: [] }, setProfile);
  expect(ok).toBe(true);
  expect(localStorage.getItem('jwt')).toBe('tok');
  expect(setProfile).toHaveBeenCalledWith({ risk_score: 1, risk_level: 2 });
});
