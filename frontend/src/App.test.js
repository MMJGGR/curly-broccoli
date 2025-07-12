import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWizard from "./components/OnboardingWizard";

test("validates fields and navigates steps", async () => {
  render(<OnboardingWizard />);
  const next = screen.getByRole("button", { name: /next/i });
  expect(next).toBeDisabled();

  await userEvent.type(
    screen.getByPlaceholderText(/email/i),
    "test@example.com",
  );
  await userEvent.type(screen.getByPlaceholderText(/^password$/i), "secret1");
  await userEvent.type(
    screen.getByPlaceholderText(/confirm password/i),
    "secret1",
  );

  expect(next).toBeEnabled();
  await userEvent.click(next);

  expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
  expect(next).toBeDisabled();

  await userEvent.type(screen.getByPlaceholderText(/first name/i), "Jane");
  await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
  await userEvent.type(
    screen.getByPlaceholderText(/date of birth/i),
    "1990-01-01",
  );
  await userEvent.type(screen.getByPlaceholderText(/national id/i), "12345678");
  await userEvent.type(screen.getByPlaceholderText(/kra pin/i), "A123456");

  expect(next).toBeEnabled();
});
