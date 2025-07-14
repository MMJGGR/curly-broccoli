import { render, screen } from "@testing-library/react";
import StepGoals from "../StepGoals";

test("renders goal dropdown", () => {
  const validate = jest.fn();
  render(<StepGoals data={{}} update={() => {}} validate={validate} />);
  expect(screen.getByRole("combobox")).toBeInTheDocument();
  expect(validate).toHaveBeenCalledWith(false);
});
