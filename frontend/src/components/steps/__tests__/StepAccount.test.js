import { render, screen } from "@testing-library/react";
import StepAccount from "../StepAccount";

test("renders account inputs and validates", () => {
  const validate = jest.fn();
  render(<StepAccount data={{}} update={() => {}} validate={validate} />);
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(false);
});
