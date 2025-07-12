import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWizard from "./components/OnboardingWizard";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ access_token: "tok" }) })
  );
  localStorage.clear();
});

test("complete onboarding flow", async () => {
  render(<OnboardingWizard />);

  // StepAccount
  await userEvent.type(screen.getByPlaceholderText(/email/i), "a@b.com");
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "secret1");
  await userEvent.type(screen.getByPlaceholderText(/confirm password/i), "secret1");
  await userEvent.click(screen.getByRole("button", { name: /next/i }));

  // StepPersonal
  await userEvent.type(screen.getByPlaceholderText(/first name/i), "Jane");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(screen.getByPlaceholderText(/date of birth/i), "1990-01-01");
  await userEvent.type(screen.getByPlaceholderText(/national id/i), "1234");
  await userEvent.type(screen.getByPlaceholderText(/kra pin/i), "A123");
  await userEvent.click(screen.getByRole("button", { name: /next/i }));

  // StepFinancial
  await userEvent.type(screen.getByPlaceholderText(/annual income/i), "100");
  await userEvent.selectOptions(screen.getByRole("combobox"), "Employed");
  await userEvent.type(screen.getByPlaceholderText(/dependents/i), "0");
  await userEvent.click(screen.getByRole("button", { name: /next/i }));

  // StepGoals
  await userEvent.selectOptions(screen.getByRole("combobox"), "Wealth");
  await userEvent.type(screen.getByPlaceholderText(/target amount/i), "1000");
  await userEvent.type(screen.getByPlaceholderText(/time horizon/i), "10");
  await userEvent.click(screen.getByRole("button", { name: /next/i }));

  // StepQuestionnaire
  const radios = screen.getAllByRole("radio", { name: "5" });
  for (const radio of radios) {
    await userEvent.click(radio);
  }
  await userEvent.click(screen.getByRole("button", { name: /next/i }));

  // Summary
  const finish = screen.getByRole("button", { name: /finish/i });
  await userEvent.click(finish);

  expect(global.fetch).toHaveBeenCalled();
  expect(localStorage.getItem("jwt")).toBe("tok");
});
