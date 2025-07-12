const { test, expect } = require('@playwright/test');

async function answerQuestionnaire(page) {
  for (let i = 0; i < 8; i++) {
    await page.check(`input[name="q${i}"][value="3"]`);
  }
}

test('complete onboarding and view risk score', async ({ page }) => {
  await page.route('**/auth/register', route => {
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ access_token: 'token' }) });
  });
  await page.route('**/profile', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ risk_score: 0.7 }) });
  });

  await page.goto('/');

  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'secret1');
  await page.fill('input[name="confirmPassword"]', 'secret1');
  await page.click('button:has-text("Next")');

  await page.fill('input[name="firstName"]', 'Jane');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="dob"]', '1990-01-01');
  await page.fill('input[name="nationalId"]', '12345678');
  await page.fill('input[name="kraPin"]', 'A123456');
  await page.click('button:has-text("Next")');

  await page.fill('input[name="annualIncome"]', '100');
  await page.selectOption('select[name="employmentStatus"]', 'Employed');
  await page.fill('input[name="dependents"]', '0');
  await page.click('button:has-text("Next")');

  await page.selectOption('select[name="goalType"]', 'Retirement');
  await page.fill('input[name="targetAmount"]', '1000');
  await page.fill('input[name="timeHorizon"]', '10');
  await page.click('button:has-text("Next")');

  await answerQuestionnaire(page);
  await page.click('button:has-text("Next")');
  await page.click('button:has-text("Finish")');

  await expect(page.locator('text=Risk Score: 0.7')).toBeVisible();
});
