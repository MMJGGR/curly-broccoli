export const saveOnboardingStep = async ({ stepNumber, stepData, token, base }) => {
  const res = await fetch(`${base}/api/v1/onboarding-v2-clean/save-step`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ step_number: stepNumber, step_data: stepData })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to save step ${stepNumber}`);
  }
  return res.json();
};

export const completeOnboardingApi = async ({ data, token, base }) => {
  const res = await fetch(`${base}/api/v1/onboarding-v2-clean/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ onboarding_data: data })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to complete onboarding');
  }
  return res.json();
};

