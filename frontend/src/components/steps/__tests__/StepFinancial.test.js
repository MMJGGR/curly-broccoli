import { render, screen } from "@testing-library/react";
import StepFinancial from "../StepFinancial";

test("renders inputs and calls validate", () => {
  const validate = jest.fn();
  render(<StepFinancial data={{}} update={() => {}} validate={validate} />);
  expect(screen.getByPlaceholderText(/annual income/i)).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(false);
});
