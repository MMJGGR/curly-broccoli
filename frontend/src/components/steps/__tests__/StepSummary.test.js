import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StepSummary from "../StepSummary";

test("renders summary of data", () => {
  const data = {
    email: "a@b.com",
    firstName: "Jane",
    lastName: "Doe",
    dob: "1990-01-01",
    nationalId: "1234",
    kraPin: "A123",
    annualIncome: 100,
    dependents: 0,
    goals: { type: "Wealth", targetAmount: 1000, timeHorizon: 10 },
    questionnaire: Array(8).fill(3),
  };
  render(
    <MemoryRouter>
      <StepSummary data={data} />
    </MemoryRouter>
  );
  expect(screen.getByText(/Wealth/)).toBeInTheDocument();
});
